import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { DatabaseService } from './db.service';
import { MapData, MapFeatureType } from '../entity/map-data.entity';
import { ConfigService } from './config.service';
import { OverpassService } from './overpass.service';
import bbox from '@turf/bbox';
import { GeoService, GeoSearchSet } from './geo.service';
import { SRTMService } from './srtm.service';
import center from '@turf/center';
import { MapCellData } from '../entity/map-cell-data.entity';
import { AnimalCellWeight } from '../entity/animal-cell-weight.entity';
import { IQRIfy } from '../libraries/Standardizer';
import { PoachingCellWeight } from '../entity/poaching-cell-weight.entity';

@Injectable()
export class MapService {
  private featureSearchSets;

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly config: ConfigService,
    private readonly overpass: OverpassService,
    private readonly geoService: GeoService,
    @Inject(forwardRef(() => SRTMService))
    private readonly altitudeService: SRTMService,
  ) {
    this.loadFeatureSearchSets();
  }

  /**
   * Updates GeoJSON map data for feature
   * @param feature The name of the feature (e.g. rivers)
   * @param properties The GeoJSON collection
   */
  private async setMapData(feature: MapFeatureType, properties: JSON): Promise<boolean> {
    const con = await this.databaseService.getConnection();
    const mapData = new MapData();

    try {
      mapData.feature = feature;
      mapData.properties = JSON.stringify(properties);
      const addedFeature = await con.getRepository(MapData).save(mapData);
      return addedFeature != null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Gets the size of cells in the map from the database
   */
  async getCellSize(): Promise<number> {
    const config = await this.config.getConfig();
    return config.cellSize;
  }

  /**
   * Update the map
   */
  private async downloadMapFeatures() {
    const name = (await this.config.getConfig()).reserveName;

    const reserves = await this.overpass.query(`relation["name"="${name}"];
      (._;>;);
      out geom;
    `);
    console.log('reserves', reserves.features.length);

    // save to table
    await this.setMapData(MapFeatureType.reserve, reserves.features[0]);

    const dams = await this.overpass
      .query(`area["name"="${name}"]->.boundaryarea;
      (
        (
          (
            nwr(area.boundaryarea)[water];
            nwr(area.boundaryarea)[natural="water"];
          ); -
          nwr(area.boundaryarea)[waterway];
        );
        - nwr(area.boundaryarea)[intermittent=yes];
      );
      (._;>;);
      out geom;
      >;`);

    console.log('dams', dams.features.length);

    // //save to table
    await this.setMapData(MapFeatureType.dams, dams.features);

    const rivers = await this.overpass
      .query(`area["name"="${name}"]->.boundaryarea;
    (
      nwr(area.boundaryarea)[waterway=river];
      - nwr(area.boundaryarea)[intermittent=yes];
    );
    (._;>;);
    out geom;
    >;`);

    console.log('rivers', rivers.features.length);

    await this.setMapData(MapFeatureType.rivers, rivers.features);

    const intermittentWater = await this.overpass
      .query(`area["name"="${name}"]->.boundaryarea;
      (
        nwr(area.boundaryarea)[water][intermittent=yes];
        nwr(area.boundaryarea)[natural=water][intermittent=yes];
        nwr(area.boundaryarea)[waterway][intermittent=yes];
        nwr(area.boundaryarea)[waterway=stream];
      );
      out geom;`);

    console.log('intermittent', intermittentWater.features.length);

    await this.setMapData(MapFeatureType.intermittent, intermittentWater.features);

    const roads = await this.overpass
      .query(`area["name"="${name}"]->.boundaryarea;
    (
      nwr(area.boundaryarea)[highway];
      nwr(area.boundaryarea)[route=road];
    );
    out geom;`);

    console.log('roads', roads.features.length);

    //save to table
    await this.setMapData(MapFeatureType.roads, roads.features);

    const residential = await this.overpass
      .query(`area["name"="${name}"]->.boundaryarea;
      (
        nwr(area.boundaryarea)[landuse=residential];
        nwr(area.boundaryarea)[barrier=fence];
      );
      out geom;`);

    // save to table
    await this.setMapData(MapFeatureType.residential, residential.features);

    console.log('residential', residential.features.length);

    const externalResidential = await this.overpass
      .query(`
        nwr[name="${name}"]->.reserve;
        area[name="${name}"]->.boundary;

        (
          .reserve;
          nwr(around:5000)[place];
          nwr(around:5000)[landuse=residential];
        )->.a;

        (
          nwr(area.boundary)[place];
          nwr(area.boundary)[landuse=residential];
        )->.b;

        (.a; - .b;)->._;
        (._; - .reserve;)->._;

        out geom;`);

    await this.setMapData(MapFeatureType.externalResidential, externalResidential.features);

    console.log('externalResidential', externalResidential.features.length);
    console.log('downloaded map data');

    // refresh search sets
    this.loadFeatureSearchSets();
  }

  /**
   * Returns a key-value object of map features
   */
  public async getMapFeatures(): Promise<{[feature in MapFeatureType]: any}> {
    const conn = await this.databaseService.getConnection();
    const features = await conn.getRepository(MapData).find();

    return features.reduce((ob, feature) => {
      ob[feature.feature] = JSON.parse(feature.properties);
      return ob;
    }, {}) as {[feature in MapFeatureType]: any};
  }

  /**
   * Returns feature search sets for each feature type in the database
   */
  public async getFeatureSearchSets(): Promise<{ [featureType: string]: GeoSearchSet }> {
    if (!this.featureSearchSets) {
      console.log('load feature search sets');
      this.loadFeatureSearchSets();
    }

    return await this.featureSearchSets;
  }

  /**
   * Sets the feature search sets promise, builds search sets for
   * each map feature.
   */
  private loadFeatureSearchSets() {
    this.featureSearchSets = new Promise(async resolve => {
      const mapFeatures = await this.getMapFeatures();

      const searchDatasets = Object.keys(mapFeatures)
        .reduce((ob, featureType: MapFeatureType) => {
          // skip reserve
          if (featureType === MapFeatureType.reserve) {
            return ob;
          }

          ob[featureType] = this.geoService.createFastSearchDataset(mapFeatures[featureType]);
          return ob;
        }, {});

      resolve(searchDatasets);
    });
  }

  /**
   * Downloads reserve and features, creates a grid from it and
   * then calculates distances for all grid cells.
   */
  public async updateMap() {
    const conn = await this.databaseService.getConnection();
    const cellsRepo = conn.getRepository(MapCellData);

    const config = await this.config.getConfig();
    const cellSizeKm = config.cellSize;

    await this.downloadMapFeatures();

    const reserve = await this.getMapFeature(MapFeatureType.reserve);

    console.log('before partitioning map', process.memoryUsage().heapUsed / 1024 / 1024);

    const cells = await cellsRepo.find();

    if (!cells.length) {
      console.log('partitioning map');
      console.time('calculate grid');
      const grid = this.geoService.partitionIntoGrid(reserve, cellSizeKm);
      console.timeEnd('calculate grid');
      let cellId = 0;
      for (const gridCell of grid) {
        cellId += 1;

        // get cell center
        const cellCenter = center(gridCell);
        const [lng, lat] = cellCenter.geometry.coordinates;
        const cell = new MapCellData();
        cell.lastVisited = new Date();
        cell.id = cellId;
        cell.cellMidLongitude = lng;
        cell.cellMidLatitude = lat;
        // get cell altitude
        const {
          averageAltitude,
          variance,
        } = await this.altitudeService.getAltitude(bbox(gridCell));

        cell.properties = {
          altitude: averageAltitude,
          slopiness: variance,
        } as any;

        cells.push(cell);
      }
    }

    // calculate distances for each cell

    // construct search datasets
    const searchDatasets = await this.getFeatureSearchSets();

    // update cell distances
    for (const cell of cells) {
      const lng = cell.cellMidLongitude;
      const lat = cell.cellMidLatitude;
      cell.properties = {
        altitude: cell.properties.altitude,
        slopiness: cell.properties.slopiness,
        distanceToRivers: searchDatasets[MapFeatureType.rivers].getNearest(lng, lat).distance,
        distanceToRoads: searchDatasets[MapFeatureType.roads].getNearest(lng, lat).distance,
        distanceToDams: searchDatasets[MapFeatureType.dams].getNearest(lng, lat).distance,
        distanceToExternalResidences: searchDatasets[MapFeatureType.externalResidential].getNearest(lng, lat).distance,
        distanceToResidences: searchDatasets[MapFeatureType.residential].getNearest(lng, lat).distance,
        distanceToIntermittentWater: searchDatasets[MapFeatureType.intermittent].getNearest(lng, lat).distance,
      };

      await cellsRepo.save(cell);
      console.log(cell.id, '/', cells.length);
    }
    console.timeEnd('distances');
  }

  /**
   * Returns cell data from the database
   */
  async getCellsData(): Promise<MapCellData[]> {
    try {
      const con = await this.databaseService.getConnection();
      return await con.getRepository(MapCellData).find();
    } catch (error) {
      console.log(error);
      console.log('Cells data not retrieved');
      return undefined;
    }
  }

  /**
   * Returns all map cells with their ID, lon and lat
   * centres. Does not return any other data.
   */
  async getMapCells(): Promise<Array<{
    id: number;
    lon: number;
    lat: number;
  }>> {
    const con = await this.databaseService.getConnection();
    try {
      const cellsData = await con.getRepository(MapCellData).find();
      return cellsData.map(cell => ({
        id: cell.id,
        lon: cell.cellMidLongitude,
        lat: cell.cellMidLatitude,
      }));
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  /**
   * Returns all weight values and corresponding cell IDs for
   * the given species and time
   * @param speciesId The species ID
   * @param time The time in minutes (e.g. 2h = 120) rounded to 2 hours
   */
  async getSpeciesWeightDataForTime(speciesId: number, time: number): Promise<{
    [cellId: number]: number;
  }> {
    const con = await this.databaseService.getConnection();
    try {
      const cellsData = await con.getRepository(AnimalCellWeight).find({
        where: {
          species: speciesId,
        },
        relations: ['species', 'cell'],
      });

      const weights = cellsData.map(cd => cd[`time${time}Weight`]);
      const normalizedWeights = IQRIfy.runOn(weights);

      return cellsData.reduce((ob, cell, cellIndex) => {
        ob[cell.cell.id] = normalizedWeights[cellIndex];
        return ob;
      }, {});
    } catch (error) {
      console.error('error');
      return undefined;
    }
  }

  /**
   * Returns all poaching cell weights with their corresponding
   * cell id.
   */
  async getCellPoachingWeight(): Promise<{
    [cellId: number]: number;
  }> {
    const con = await this.databaseService.getConnection();
    try {
      console.log('Getting cell data');
      const cellsData = await con.getRepository(PoachingCellWeight).find({
        relations: ['cell']
      });
      console.log('Got cell data', cellsData.length);

      const weights = cellsData.map(cw => cw.weight);
      const standardizedWeights = IQRIfy.runOn(weights);

      return cellsData.reduce((ob, cd, cdIdx) => {
        ob[cd.cell.id] = standardizedWeights[cdIdx];
        return ob;
      }, {});
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  /**
   * Returns a list of reserves in a given bounding box
   * @param left
   * @param bottom
   * @param right
   * @param top
   */
  async findReservesInArea(left, bottom, right, top) {
    const query = `nwr[leisure=nature_reserve](${bottom},${left},${top},${right});(._;>;);out;`;
    return await this.overpass.query(query);
  }

  /**
   * Returns a single map feature stored in the database
   */
  async getMapFeature(featureName: MapFeatureType): Promise<any> {
    const conn = await this.databaseService.getConnection();
    const mapData = conn.getRepository(MapData);

    const feature = await mapData.findOne({
      where: {
        feature: featureName,
      },
    });

    if (!feature) {
      return undefined;
    }

    return JSON.parse(feature.properties);
  }
}

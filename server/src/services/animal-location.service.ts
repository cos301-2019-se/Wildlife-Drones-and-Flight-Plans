import { Injectable } from '@nestjs/common';
import { DatabaseService } from './db.service';
import { AnimalLocation } from '../entity/animal-location.entity';
import { CsvReader } from './csv-reader.service';
import { MapUpdaterService } from './map-updater.service';
import { GeoService, GeoSearchSet } from './geo.service';
import { SRTMService } from './srtm.service';
import bbox from '@turf/bbox';
import { lengthToDegrees } from '@turf/helpers';
import { Species } from '../entity/animal-species.entity';
import { ReserveConfiguration } from '../entity/reserve-configuration.entity';

const LOCATION_BIAS = lengthToDegrees(300, 'meters');

@Injectable()
export class AnimalLocationService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly csvReader: CsvReader,
    private readonly mapUpdater: MapUpdaterService,
    private readonly geo: GeoService,
    private readonly altitude: SRTMService,
  ) {}

  async addAnimalLocationData(
    animalId: string,
    date: Date,
    lon: number,
    lat: number,
    animalSpecies: string,
    temp: number,
    habitat: string,
  ): Promise<boolean> {
    const con = await this.databaseService.getConnection();
    // let animalLocations = new AnimalLocation();

    const animalSpeciseType = await con
      .getRepository(Species)
      .findOne({ species: animalSpecies });

    if (animalSpeciseType == undefined) {
      console.log('Species not found');
      return false;
    } else {
      console.time('get map data');

      const reserve = await con.getRepository(ReserveConfiguration).findOne({});

      const mapData = await this.mapUpdater.getMapFeatures(reserve.reserveName); // TODO: make dynamic based on database reserve selection

      const bounds = bbox(mapData.reserve);
      console.time('feature searchers');
      const featureSearchers: { [s: string]: GeoSearchSet } = Object.keys(
        mapData.features,
      ).reduce((searchers, featureName) => {
        searchers[featureName] = this.geo.createFastSearchDataset(
          mapData.features[featureName],
        );
        return searchers;
      }, {});
      console.timeEnd('feature searchers');

      console.timeEnd('get map data');

      const latitude = parseFloat(lat.toString());
      const longitude = parseFloat(lon.toString());
      const locationBounds = [
        longitude - LOCATION_BIAS, // left
        latitude - LOCATION_BIAS, // bottom
        longitude + LOCATION_BIAS, // right
        latitude + LOCATION_BIAS, // top
      ];

      const altitudeInfo = await this.altitude.getAltitude(
        locationBounds,
        bounds,
      );

      const entryDate = new Date(date);

      let damDis = featureSearchers.dams.getNearest(lon, lat).distance;
      let riverDis = featureSearchers.rivers.getNearest(lon, lat)
      .distance
      let roadsDis = featureSearchers.roads.getNearest(lon, lat).distance;
      let residentialDis = featureSearchers.residential.getNearest(
        lon,
        lat,
      ).distance;
      let intermittentWaterDis = featureSearchers.intermittentWater.getNearest(
        lon,
        lat,
      ).distance;
      let streamsDis = featureSearchers.dams.getNearest(lon, lat).distance;

      if (damDis == null) {
        damDis = -100;
      }
      if (riverDis == null) {
        riverDis = -100;
      }
      if (roadsDis == null) {
        roadsDis = -100;
      }
      if (residentialDis == null) {
        residentialDis = -100;
      }
      if (intermittentWaterDis == null) {
        intermittentWaterDis = -100;
      }
      if (streamsDis == null) {
        streamsDis = -100;
      }

      try {
        const animalLocations: AnimalLocation = {
          animalId: animalId,
          latitude: lat,
          longitude: lon,
          timestamp: entryDate,
          temperature: temp,
          habitat: habitat,
          month: entryDate.getMonth() + 1,
          time: entryDate.getHours() * 60 + entryDate.getMinutes(),
          distanceToDams: damDis,
          distanceToRivers: riverDis,
          distanceToRoads: roadsDis,
          distanceToResidences: residentialDis,
          distanceToIntermittentWater: intermittentWaterDis,
          altitude: altitudeInfo.averageAltitude,
          slopiness: altitudeInfo.variance,
          species: animalSpeciseType,
          distanceStreams: streamsDis,
          active: true,
        };

        const addedAnimalLocation = await con
          .getRepository(AnimalLocation)
          .save(animalLocations);

        console.log(
          'Saved a new animal loction with id: ' + animalLocations.id,
        );

        return addedAnimalLocation != null;
      } catch (error) {
        console.log(error);
        console.log('animal location was not saved');
        return false;
      }
    }   
  }

  async addAnimalLocationDataCSV(filename): Promise<void> {
    const csvFile = filename;
    const MAX_BUFFER_SIZE = 50000;
    let buffer: AnimalLocation[] = [];

    const conn = await this.databaseService.getConnection();
    const animalLocations = conn.getRepository(AnimalLocation);

    const animalSpeciesType = await JSON.parse(
      JSON.stringify(await conn.getRepository(Species).find()),
    );

    //console.log("type: " + JSON.stringify(animalSpeciseType));
    //console.log("type 0 id: " + JSON.stringify(animalSpeciseType[0]['id']));

    console.time('get map data');

    const reserve = await conn.getRepository(ReserveConfiguration).findOne({});

    const mapData = await this.mapUpdater.getMapFeatures(reserve.reserveName); // TODO: make dynamic based on database reserve selection

    const bounds = bbox(mapData.reserve);
    console.time('feature searchers');
    const featureSearchers: { [s: string]: GeoSearchSet } = Object.keys(
      mapData.features,
    ).reduce((searchers, featureName) => {
      searchers[featureName] = this.geo.createFastSearchDataset(
        mapData.features[featureName],
      );
      return searchers;
    }, {});
    console.timeEnd('feature searchers');

    console.timeEnd('get map data');

    const csvReader = this.csvReader.readCSV(csvFile);

    let countInserted = 0;

    const insertRow = () => {
      csvReader.pause();
      const bufferSize = buffer.length;
      const rowsToInsert = buffer;
      buffer = [];

      animalLocations
        .save(rowsToInsert, {
          chunk: 100,
        })
        .then(() => {
          countInserted += bufferSize;
          console.log('================== inserted', countInserted);
          csvReader.resume();
        });
    };

    let id = 0;
    csvReader.onData(async row => {
      id++;
      const idCopy = id;
      await new Promise(resolve => setTimeout(resolve, 0));
      console.log('inserting', idCopy);

      if (typeof row === 'undefined') {
        // end of csv - insert the remaining rows
        insertRow();
        return;
      }

      // row = JSON.stringify(row)

      const lat = parseFloat(row['location-lat']);
      const lng = parseFloat(row['location-long']);
      const locationBounds = [
        lng - LOCATION_BIAS, // left
        lat - LOCATION_BIAS, // bottom
        lng + LOCATION_BIAS, // right
        lat + LOCATION_BIAS, // top
      ];

      console.log('lat: ' + lat);

      const altitudeInfo = await this.altitude.getAltitude(
        locationBounds,
        bounds,
      );

      const rowDate = new Date(row.timestamp);

      // console.log('row: ' + JSON.stringify(row) );

      // console.log('row species: ' + await row['species'])

      let species;
      let leng = animalSpeciesType.length;

      for (let a = 0; a < leng; a++) {
        if (row['species'] == animalSpeciesType[a]['species']) {
          species = animalSpeciesType[a]['id'];
          a += leng;
        }
      }

      let damDis = featureSearchers.dams.getNearest(lng, lat).distance;
      let riverDis = featureSearchers.rivers.getNearest(lng, lat)
      .distance
      let roadsDis = featureSearchers.roads.getNearest(lng, lat).distance;
      let residentialDis = featureSearchers.residential.getNearest(
        lng,
        lat,
      ).distance;
      let intermittentWaterDis = featureSearchers.intermittentWater.getNearest(
        lng,
        lat,
      ).distance;
      let streamsDis = featureSearchers.dams.getNearest(lng, lat).distance;

      if (damDis == null) {
        damDis = -100;
      }
      if (riverDis == null) {
        riverDis = -100;
      }
      if (roadsDis == null) {
        roadsDis = -100;
      }
      if (residentialDis == null) {
        residentialDis = -100;
      }
      if (intermittentWaterDis == null) {
        intermittentWaterDis = -100;
      }
      if (streamsDis == null) {
        streamsDis = -100;
      }

      //console.log('species: ' + species);

      try {
        const location: AnimalLocation = {
          animalId: row['individual-local-identifier'],
          latitude: lat,
          longitude: lng,
          timestamp: rowDate,
          temperature: row['external-temperature'],
          habitat: row.habitat,
          month: rowDate.getMonth() + 1,
          time: rowDate.getHours() * 60 + rowDate.getMinutes(),
          id: idCopy,
          distanceToDams: damDis,
          distanceToRivers: riverDis,
          distanceToRoads: roadsDis,
          distanceToResidences: residentialDis,
          distanceToIntermittentWater: intermittentWaterDis,
          altitude: altitudeInfo.averageAltitude,
          slopiness: altitudeInfo.variance,
          species: species,
          distanceStreams: streamsDis,
          active: true,
        };

        buffer.push(location);
        if (buffer.length === MAX_BUFFER_SIZE) {
          insertRow();
        }
      } catch (error) {
        console.log(error);
      }
    });
  }

  async getAllAnimalsLocationTableData(): Promise<JSON> {
    const con = await this.databaseService.getConnection();
    const animalData = JSON.parse(
      JSON.stringify(await con.getRepository(AnimalLocation).find()),
    );
    return animalData;
  }

  async getIndividualAnimalLocationTableData(animalID): Promise<JSON> {
    const con = await this.databaseService.getConnection();
    return JSON.parse(
      JSON.stringify(
        await con.getRepository(AnimalLocation).find({ animalId: animalID }),
      ),
    );
  }

  async getSpeciesLocationTableData(animalSpecies): Promise<JSON> {
    const con = await this.databaseService.getConnection();

    const animalSpeciseType = await JSON.parse(
      JSON.stringify(
        await con.getRepository(Species).find({ species: animalSpecies }),
      ),
    );

    try {
      return JSON.parse(
        JSON.stringify(
          await con
            .getRepository(AnimalLocation)
            .find({ species: animalSpeciseType[0]['id'] }),
        ),
      );
    } catch (error) {
      return JSON.parse('false');
    }
  }

  async deactivateAnimal(animalId): Promise<Boolean> {
    const con = await this.databaseService.getConnection();

    const animal = await con
      .getRepository(AnimalLocation)
      .findOne({ id: animalId });

    try {
      animal.active = false;

      const addedAnimal = await con.getRepository(AnimalLocation).save(animal);
      return true;
    } catch (error) {
      return false;
    }
  }
}

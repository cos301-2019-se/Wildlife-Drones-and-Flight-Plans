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
    long: number,
    lat: number,
    animalSpecies: string,
  ): Promise<boolean> {
    const con = await this.databaseService.getConnection();
    let animalLocations = new AnimalLocation();

    try {
      const animalSpeciseType = await con
        .getRepository(Species)
        .findOne({ species: animalSpecies });

      animalLocations.species = await animalSpeciseType;
      animalLocations.animalId = animalId;
      animalLocations.timestamp = date;
      animalLocations.month = date[1];
      animalLocations.time = date[3];
      animalLocations.longitude = long;
      animalLocations.latitude = lat;
      animalLocations.temperature = 0;
      animalLocations.habitat = '';
      animalLocations.distanceToRivers = 0;
      animalLocations.distanceToDams = 0;
      animalLocations.distanceToIntermittentWater = 0;
      animalLocations.distanceToResidences = 0;
      animalLocations.distanceToRoads = 0;
      animalLocations.altitude = 0;
      animalLocations.slopiness = 0;
      const addedAnimalLocation = await con
        .getRepository(AnimalLocation)
        .save(animalLocations);

      console.log('Saved a new animal loction with id: ' + animalLocations.id);

      return addedAnimalLocation != null;
    } catch (error) {
      console.log(error);
      console.log('animal location was not saved');
      return false;
    }

    // if (addAnimal != null) {
    //     return true;
    // }
    // else {

    //     return false;
    // }

    //return false;
  }

  async addAnimalLocationDataCSV(filename): Promise<void> {
    const csvFile = filename;
    const MAX_BUFFER_SIZE = 50000;
    let buffer: AnimalLocation[] = [];

    const conn = await this.databaseService.getConnection();
    const animalLocations = conn.getRepository(AnimalLocation);

    const animalSpeciseType = await JSON.parse(
      JSON.stringify(await conn.getRepository(Species).find()),
    );

    //console.log("type: " + JSON.stringify(animalSpeciseType));
    //console.log("type 0 id: " + JSON.stringify(animalSpeciseType[0]['id']));

    console.time('get map data');
    const mapData = await this.mapUpdater.getMapFeatures(
      'Kruger National Park',
    ); // TODO: make dynamic based on database reserve selection

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

      //console.log('row: ' + JSON.stringify(row) );

      //console.log('row species: ' + await row['species'])

      let species;
      let leng = animalSpeciseType.length;

      for (let a = 0; a < leng; a++) {
        if (row['species'] == animalSpeciseType[a]['species']) {
          species = animalSpeciseType[a]['id'];
          a += leng;
        }
      }

      console.log('species: ' + species);

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
          distanceToDams: featureSearchers.dams.getNearest(lng, lat).distance,
          distanceToRivers: featureSearchers.rivers.getNearest(lng, lat)
            .distance,
          distanceToRoads: featureSearchers.roads.getNearest(lng, lat).distance,
          distanceToResidences: featureSearchers.residential.getNearest(
            lng,
            lat,
          ).distance,
          distanceToIntermittentWater: featureSearchers.intermittentWater.getNearest(
            lng,
            lat,
          ).distance,
          altitude: altitudeInfo.averageAltitude,
          slopiness: altitudeInfo.variance,
          species: species,
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
}

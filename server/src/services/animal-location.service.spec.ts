import { AnimalLocationService } from './animal-location.service';
import { DatabaseService } from './db.service';

import { CsvReader } from './csv-reader.service';
import { MapUpdaterService } from './map-updater.service';
import { GeoService } from './geo.service';
import { SRTMService } from './srtm.service';
import { OverpassService } from './overpass.service';
import { MapPartitionerService } from '../services/map-partitioner.service';
import { Test, TestingModule } from '@nestjs/testing';
import { AnimalController } from '../controllers/animal-location.controller';
import { AnimalLocation } from '../entity/animal-location.entity';
import { Species } from '../entity/animal-species.entity';
import { providers } from '../app.providers';
import { imports } from '../app.imports';
import { controllers } from '../app.controllers';

//not sure if 10000 is long enough
jest.setTimeout(10000);


let controller;

beforeAll(async () => {
  const module: TestingModule = await Test.createTestingModule({
    imports:imports,
    controllers:controller,
    providers:providers
  }).compile();

  controller = await module.get<DatabaseService>(DatabaseService);
  const con = await controller.getConnection();
  const animalCon = await con.getRepository(AnimalLocation);

  animalCon.clear();

  const date = new Date();

  const animalSpeciseType = await con
        .getRepository(Species)
        .findOne({ species: 'Elephant' });

  const location1: AnimalLocation = {
    animalId: 'AM105',
    latitude: 21.548752,
    longitude: 25.4884,
    timestamp: date,
    temperature: 999,
    habitat: 'Ocean',
    month: date.getMonth() + 1,
    time: date.getHours() * 60 + date.getMinutes(),
    distanceToDams: 999999,
    distanceToRivers: 999999,
    distanceToRoads: 999999,
    distanceToResidences: 999999,
    distanceToIntermittentWater: 999999,
    altitude: 999999,
    slopiness: 999999,
    species: animalSpeciseType,
    active: true,
    distanceStreams: 999999,
  };

  const location2: AnimalLocation = {
    animalId: 'AM105',
    latitude: 21.54365,
    longitude: 25.48124,
    timestamp: date,
    temperature: 999,
    habitat: 'Ocean',
    month: date.getMonth() + 1,
    time: date.getHours() * 60 + date.getMinutes(),
    distanceToDams: 999999,
    distanceToRivers: 999999,
    distanceToRoads: 999999,
    distanceToResidences: 999999,
    distanceToIntermittentWater: 999999,
    altitude: 999999,
    slopiness: 999999,
    species: animalSpeciseType,
    active: true,
    distanceStreams: 999999,
  };

  const location3: AnimalLocation = {
    animalId: 'AM105',
    latitude: 21.54845,
    longitude: 25.4888,
    timestamp: date,
    temperature: 999,
    habitat: 'Ocean',
    month: date.getMonth() + 1,
    time: date.getHours() * 60 + date.getMinutes(),
    distanceToDams: 999999,
    distanceToRivers: 999999,
    distanceToRoads: 999999,
    distanceToResidences: 999999,
    distanceToIntermittentWater: 999999,
    altitude: 999999,
    slopiness: 999999,
    species: animalSpeciseType,
    active: true,
    distanceStreams: 999999,
  };

  const location4: AnimalLocation = {
    animalId: 'AM107',
    latitude: 21.54378,
    longitude: 25.48178,
    timestamp: date,
    temperature: 999,
    habitat: 'Ocean',
    month: date.getMonth() + 1,
    time: date.getHours() * 60 + date.getMinutes(),
    distanceToDams: 999999,
    distanceToRivers: 999999,
    distanceToRoads: 999999,
    distanceToResidences: 999999,
    distanceToIntermittentWater: 999999,
    altitude: 999999,
    slopiness: 999999,
    species: animalSpeciseType,
    active: true,
    distanceStreams: 999999,
  };

  const location5: AnimalLocation = {
    animalId: 'AM108',
    latitude: 21.54312,
    longitude: 25.48845,
    timestamp: date,
    temperature: 999,
    habitat: 'Ocean',
    month: date.getMonth() + 1,
    time: date.getHours() * 60 + date.getMinutes(),
    distanceToDams: 999999,
    distanceToRivers: 999999,
    distanceToRoads: 999999,
    distanceToResidences: 999999,
    distanceToIntermittentWater: 999999,
    altitude: 999999,
    slopiness: 999999,
    species: animalSpeciseType,
    active: true,
    distanceStreams: 999999
  };

  await animalCon.save(location1);
  await animalCon.save(location2);
  await animalCon.save(location3);
  await animalCon.save(location4);
  await animalCon.save(location5);

  controller = await module.get<AnimalLocationService>(AnimalLocationService);
});

describe('Get individual animal data', () => {
  it('should find only the rows with the given animal id AM105', async () => {
    const animalId = 'AM105';
    const res: AnimalLocation[] = await controller.getIndividualAnimalLocationTableData(
      animalId,
    );

    expect(res.every(loc => loc.animalId === animalId)).toBe(true);
  });

  it('should not find the rows with the given animal id AM2', async () => {
    const animalId = 'AM2';
    const res: AnimalLocation[] = await controller.getIndividualAnimalLocationTableData(
      animalId,
    );
    expect(res.length).toBe(0);
  });
});

describe('Get all animal data', () => {
  it('should find all the rows for animal location data AM105, AM107 and AM108', async () => {
    const res: AnimalLocation[] = await controller.getAllAnimalsLocationTableData();
    expect(
      res.every(
        loc =>
          loc.animalId === 'AM105' ||
          loc.animalId === 'AM107' ||
          loc.animalId === 'AM108',
      ),
    ).toBe(true);
  });
});

import { Injectable} from '@nestjs/common';
import { DatabaseService } from './db.service';
import { AnimalLocation } from '../entity/animal-location';
import { CsvReader } from './csv-reader.service';
import { MapUpdaterService } from '../providers/map-updater.service';
import { GeoService, GeoSearchSet } from '../providers/geo.service';
import { SRTMService } from '../providers/srtm.service';
import bbox from '@turf/bbox';
import { lengthToDegrees } from '@turf/helpers';

const LOCATION_BIAS = lengthToDegrees(300, 'meters');

@Injectable()
export class AnimalLocationService {

    constructor(
        private readonly databaseService: DatabaseService,
        private readonly csvReader: CsvReader,
        private readonly mapUpdater: MapUpdaterService,
        private readonly geo: GeoService,
        private readonly altitude: SRTMService,
    ) { }

    addAnimalLocationData(): boolean {

        // const con = this.databaseService.getConnection();
        // let addAnimal = con.then(async (data) => {
        //     let animalLocations = new AnimalLocation();
        //             animalLocations.id = 1;
        //             animalLocations.date = '2007/08/13';
        //             animalLocations.year = '2007';
        //             animalLocations.month = '08';
        //             animalLocations.day = '13';
        //             animalLocations.time = '02:00:00.000';
        //             animalLocations.hour = '02';
        //             animalLocations.minute = '00';
        //             animalLocations.second = '00.000';
        //             animalLocations.longitude = '31.87399';
        //             animalLocations.latitude = '-24.81483';
        //         return data.manager.save(animalLocations).then(animalLocations =>
        //         { console.log('Saved a new animal loction with id: ' + animalLocations.id) });
        //     });


        // if (addAnimal != null) {
        //     return true;
        // }
        // else {

        //     return false;
        // }

        return false;
    }

    async addAnimalLocationDataCSV(filename): Promise<void> {
        const csvFile = filename;
        const MAX_BUFFER_SIZE = 50000;
        let buffer: AnimalLocation[] = [];

        const conn = await this.databaseService.getConnection();
        const animalLocations = conn.getRepository(AnimalLocation);

        console.time('get map data');
        const mapData = await this.mapUpdater.getMapFeatures('Kruger National Park'); // TODO: make dynamic based on database reserve selection

        const bounds = bbox(mapData.reserve);
        console.time('feature searchers');
        const featureSearchers: {[s: string]: GeoSearchSet} = Object.keys(mapData.features)
            .reduce((searchers, featureName) => {
                searchers[featureName] = this.geo.createFastSearchDataset(mapData.features[featureName]);
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

            animalLocations.save(rowsToInsert, {
                chunk: 100,
            }).then(() => {
                countInserted += bufferSize;
                console.log('================== inserted', countInserted);
                csvReader.resume();
            });
        };

        let id = 0;
        csvReader.onData(async row => {
            id++;
            let idCopy = id;
            await new Promise(resolve => setTimeout(resolve, 0));
            console.log('inserting', idCopy);

            if (typeof row === 'undefined') {
                // end of csv - insert the remaining rows
                insertRow();
                return;
            }

            const lat = parseFloat(row['location-lat']);
            const lng = parseFloat(row['location-long']);
            const locationBounds = [
                lng - LOCATION_BIAS, // left
                lat - LOCATION_BIAS, // bottom
                lng + LOCATION_BIAS, // right
                lat + LOCATION_BIAS, // top
            ];

            const altitudeInfo = await this.altitude.getAltitude(locationBounds, bounds);

            const rowDate = new Date(row.timestamp);

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
                distanceToRivers: featureSearchers.rivers.getNearest(lng, lat).distance,
                distanceToRoads: featureSearchers.roads.getNearest(lng, lat).distance,
                distanceToResidences: featureSearchers.residential.getNearest(lng, lat).distance,
                distanceToIntermittentWater: featureSearchers.intermittentWater.getNearest(lng, lat).distance,
                altitude: altitudeInfo.averageAltitude,
                slopiness: altitudeInfo.variance,
            };

            buffer.push(location);
            if (buffer.length === MAX_BUFFER_SIZE) {
                insertRow();
            }
        });
    }

    async getAllAnimalsLocationTableData(): Promise<JSON> {
        const con = await this.databaseService.getConnection();
        let animaldata = JSON.parse(JSON.stringify( await con.getRepository(AnimalLocation).find()));
        return animaldata;
    }

    async getIndividualAnimalLocationTableData(animalID): Promise<JSON> {
        const con = await this.databaseService.getConnection();
        return JSON.parse(JSON.stringify( await con.getRepository(AnimalLocation).find({ animalId : animalID })));
    }

}





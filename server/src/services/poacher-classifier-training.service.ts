import { Injectable } from '@nestjs/common';
import { Classifier } from './animal-classifier.service';
import { PoachingIncidentService } from '../services/poaching-incident.service';
import { MapCellDataService } from '../services/map-cell-data.service';
import { PoachingCellWeightService } from './poaching-cell-weight.service';
//  Need to fetch the data
//  Need to train the classifier with the data
//  Need to be able to get classification
//  Need to store trained classifier in memory

@Injectable()
export class ClassifierTrainingPoaching {
    private classifier: any;
    constructor(private readonly poachingIncidentService: PoachingIncidentService, private readonly mapCell: MapCellDataService,
                private readonly poachingCell: PoachingCellWeightService) {
    }

    //  Trains the model
    // Fetch data from database then train on that data
    async trainModel() {
        //  fetch data by species name
        // console.log('test');
        const data = await this.poachingIncidentService.getAllPoachingIncidentTableData();
        // console.log('test');
        const jsonData = JSON.parse(JSON.stringify(data));
        const teachingData = [];
        // sort all data to teach classifier
        jsonData.forEach(incident => {
            //console.log(incident);
            const coordinateData  = JSON.parse(incident.CoordinateData);
            //console.log(coordinateData);
            teachingData.push({
                // month: parseInt(incident.month), unsure of relavance
                // time: parseInt(incident.time),  // not used at the moment
               /* distanceToFarm: parseFloat(coordinateData.distanceToFarm),
                distanceToVillage: parseFloat(coordinateData.distanceToVillage),
                distanceToTown: parseFloat(coordinateData.distanceToTown),
                distanceToSuburb: parseFloat(coordinateData.distanceToSuburb),
                distanceToStream: parseFloat(coordinateData.distanceToStream),*/
                distanceToRivers: parseFloat(coordinateData.distanceToRivers),
                distanceToDams: parseFloat(coordinateData.distanceToDams),
                distanceToRoads: parseFloat(coordinateData.distanceToRoads),
                distanceToResidences: parseFloat(coordinateData.distanceToResidences),
                distanceToIntermittentWater: parseFloat(coordinateData.distanceToIntermittentWater),
                altitude: parseFloat(coordinateData.altitude),
                slopiness: parseFloat(coordinateData.slopiness),
            });
        });
       //console.log(teachingData);
        //  Populate classifier with teaching data
        this.classifier = new Classifier(teachingData);
        console.log('Done Training Classifier');
        //  Once classifier is done being taught we need to fetch all map cell data midpoints from the database.
        const result = await this.mapCell.getCellsData();
        const cellData = JSON.parse(JSON.stringify(result));
        const midPointClassification = [];
        const midPointCellID = [];
        cellData.forEach(cell => {
            midPointClassification.push(
                {
                    distanceToRivers: parseFloat(cell.distanceToRivers),
                    distanceToDams: parseFloat(cell.distanceToDams),
                    distanceToRoads: parseFloat(cell.distanceToRoads),
                    distanceToResidences: parseFloat(cell.distanceToResidences),
                    distanceToIntermittentWater: parseFloat(cell.distanceToIntermittentWater),
                    altitude: parseFloat(cell.altitude),
                    slopiness: parseFloat(cell.slopiness)
                }
            );
            midPointCellID.push(parseInt(cell.id));
        });
        //  Once all midpoints have been fetched we need we need to get a classification on each midpoint
        const classifications = this.getClassification(midPointClassification, midPointCellID);
        // const speciesID = await this.species.getSpeciesID(speciesName);
        // Find min and max values
        let max = -Infinity;
        const min = 0;
        const weightedData = classifications.dataArray;
        weightedData.forEach(element => {
            if (element.weight > max) {
                max = element.weight;
            }
        });
        let newMax = -Infinity;
        // We need to normalise all the data so we can have percentages
        weightedData.forEach(element => {
            element.weight = this.normalize(min, max, element.weight);
            if (element.weight > newMax) {
                newMax = element.weight;
            }
           // element.speciesId = speciesID;
        });
        // tslint:disable-next-line:prefer-const
        const toAdd = 1 - newMax; // to get values between for example 0.6 and 1 instead of 0.2 and 0.4
        weightedData.forEach(element => {
            element.weight = element.weight + toAdd;
        });
        // add all weight to database
        const added = await this.poachingCell.addPoachingCellsWeight(weightedData);
        return added;
    }
    private normalize(min, max, data) {
        // const delta = max - min;
        // const val = (data - min) / delta;
        return 1 - (data / max) ;
    }

    // Need to call this method to get a classification
    private getClassification(data, dataID) {
        const dataArray = [];
        let count = 0;
        const total = 38680;
        //console.log(data);
        data.forEach((training, index) => {
            dataArray.push(
                {
                    cellId: dataID[index],
                    weight: this.classifier.getDistance(training),
                }
            );
            count++;
            if (count % 100 === 0) {
               console.log('cell ' + count + ' of ' + total);

                // break;
            }
        });
        return JSON.parse(
            JSON.stringify({
                dataArray,
            }),
        );
    }
}

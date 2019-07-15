import { Injectable } from '@nestjs/common';
import { Classifier } from './animal-classifier.service';
import { PoachingIncidentService } from '../services/poaching-incident.service';
import { MapCellDataService } from '../services/map-cell-data.service';
import { SpeciesService } from '../services/species.service';
import { AnimalCellWeightService } from '../services/animal-cell-weight.service';
//  Need to fetch the data
//  Need to train the classifier with the data
//  Need to be able to get classification
//  Need to store trained classifier in memory

@Injectable()
export class ClassifierTrainingPoaching {
    private classifier: any;
    constructor(private readonly poachingIncidentService: PoachingIncidentService, private readonly mapCell: MapCellDataService) {
    }

    //  Trains the model
    // Fetch data from database then train on that data
    async trainModel() {
        //  fetch data by species name
        const data = await this.poachingIncidentService.getAllPoachingIncidentTableData();

        const jsonData = JSON.parse(JSON.stringify(data));
        const teachingData = [];
        // sort all data to teach classifier
        jsonData.forEach(incident => {
            teachingData.push({
                month: parseInt(incident.month),
                time: parseInt(incident.time),
                // temperature: parseInt(incident.temperature),
                distanceToRivers: parseFloat(incident.distanceToRivers),
                distanceToDams: parseFloat(incident.distanceToDams),
                distanceToRoads: parseFloat(incident.distanceToRoads),
                distanceToResidences: parseFloat(incident.distanceToResidences),
                distanceToIntermittentWater: parseFloat(incident.distanceToIntermittentWater),
                altitude: parseFloat(incident.altitude),
                slopiness: parseFloat(incident.slopiness),
            });
        });
        //  Populate classifier with teaching data
        this.classifier = new Classifier(teachingData);
        console.log('Done Training Classifier');
        //  Once classifier is done being taught we need to fetch all map cell data midpoints from the database.
        const result = await this.mapCell.getCellsData();
        const cellData = JSON.parse(JSON.stringify(result));
        const midPointClassification = [];
        const midPointCellID = [];
        const date = new Date();
        const month = date.getMonth() + 1;
        const currentHours = date.getHours();
        const currentMinutes = date.getMinutes();
        const time = (currentHours * 60) + currentMinutes;
        cellData.forEach(cell => {
            midPointClassification.push(
                {
                    month: month,
                    time: time,
                    // temperature: parseInt(animal.temperature),
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
        const toAdd = 1 - newMax;
        weightedData.forEach(element => {
            element.weight = element.weight + toAdd;
        });
        // add all weight to database
       // const added = await this.animalCell.addAnimalCellsWeight(weightedData);
        // return added;
    }
    private normalize(min, max, data) {
        // const delta = max - min;
        // const val = (data - min) / delta;
        return max - data;
    }

    // Need to call this method to get a classification
    private getClassification(data, dataID) {
        const dataArray = [];
        data.forEach((training, index) => {
            dataArray.push(
                {
                    cellId: dataID[index],
                    weight: this.classifier.getDistance(training),
                }
            );
        });
        return JSON.parse(
            JSON.stringify({
                dataArray,
            }),
        );
    }
}

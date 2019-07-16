import { Injectable } from '@nestjs/common';
import { Classifier } from './animal-classifier.service';
import { AnimalLocationService } from '../services/animal-location.service';
import { MapCellDataService } from '../services/map-cell-data.service';
import { SpeciesService } from '../services/species.service';
import { AnimalCellWeightService } from '../services/animal-cell-weight.service';
//  Need to fetch the data
//  Need to train the classifier with the data
//  Need to be able to get classification
//  Need to store trained classifier in memory

@Injectable()
export class ClassifierTraining {
    private classifier: any;
    constructor(private readonly animalLocationService: AnimalLocationService, private readonly mapCell: MapCellDataService
        ,       private readonly species: SpeciesService, private readonly animalCell: AnimalCellWeightService) {
    }

    //  Trains the model
    // Fetch data from database then train on that data
    async trainModel(speciesName) {
        //  fetch data by species name
        const data = await this.animalLocationService.getSpeciesLocationTableData(speciesName);
        const jsonData = JSON.parse(JSON.stringify(data));
      //  console.log(jsonData);
        const teachingData = [];
        jsonData.forEach(animal => {
            teachingData.push({
                month: parseInt(animal.month),
                time: parseInt(animal.time),
                // temperature: parseInt(animal.temperature),
                distanceToRivers: parseFloat(animal.distanceToRivers),
                distanceToDams: parseFloat(animal.distanceToDams),
                distanceToRoads: parseFloat(animal.distanceToRoads),
                distanceToResidences: parseFloat(animal.distanceToResidences),
                distanceToIntermittentWater: parseFloat(animal.distanceToIntermittentWater),
                altitude: parseFloat(animal.altitude),
                slopiness: parseFloat(animal.slopiness),
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
       // const time = (currentHours * 60) + currentMinutes;
        cellData.forEach(cell => {
            for (let i = 0; i < 12; i++) {
                let time = 120 * i;
                midPointClassification.push(
                {

                      month: month,
                      time: time, // plus 120
                      // temperature: parseInt(animal.temperature),
                      distanceToRivers: parseFloat(cell.distanceToRivers),
                      distanceToDams: parseFloat(cell.distanceToDams),
                      distanceToRoads: parseFloat(cell.distanceToRoads),
                      distanceToResidences: parseFloat(cell.distanceToResidences),
                      distanceToIntermittentWater: parseFloat(cell.distanceToIntermittentWater),
                      altitude: parseFloat(cell.altitude),
                      slopiness: parseFloat(cell.slopiness)
                });
                }
            midPointCellID.push(parseInt(cell.id));
            });
        //  Once all midpoints have been fetched we need we need to get a classification on each midpoint
        const classifications = this.getClassification(midPointClassification, midPointCellID);
        const speciesID = await this.species.getSpeciesID(speciesName);
        // Find min and max values
        let max = [-Infinity, -Infinity, -Infinity, -Infinity, -Infinity,
            -Infinity, -Infinity, -Infinity, -Infinity, -Infinity, -Infinity,
            -Infinity];
        const min = 0;
        const weightedData = classifications.dataArray;
        weightedData.forEach(element => {
            let weightIndex = 0; // keep track of which max
            // Calculates max per weight (per 2 hours)
            max[weightIndex] = this.compareMax(max[weightIndex++], element.weight0);
            max[weightIndex] = this.compareMax(max[weightIndex++], element.weight120);
            max[weightIndex] = this.compareMax(max[weightIndex++], element.weight240);
            max[weightIndex] = this.compareMax(max[weightIndex++], element.weight360);
            max[weightIndex] = this.compareMax(max[weightIndex++], element.weight480);
            max[weightIndex] = this.compareMax(max[weightIndex++], element.weight600);
            max[weightIndex] = this.compareMax(max[weightIndex++], element.weight720);
            max[weightIndex] = this.compareMax(max[weightIndex++], element.weight840);
            max[weightIndex] = this.compareMax(max[weightIndex++], element.weight960);
            max[weightIndex] = this.compareMax(max[weightIndex++], element.weight1080);
            max[weightIndex] = this.compareMax(max[weightIndex++], element.weight1200);
            max[weightIndex] = this.compareMax(max[weightIndex++], element.weight1320);
            //console.log('maxes ' + max);
        });
        let newMax = [-Infinity, -Infinity, -Infinity, -Infinity, -Infinity,
            -Infinity, -Infinity, -Infinity, -Infinity, -Infinity, -Infinity,
            -Infinity];
        // We need to normalise all the data so we can have percentages
        weightedData.forEach(element => {
            let weightIndex = 0; // keep track of which max
            // assign each weight the normalized value
            element.weight0  = this.normalize(min, max[weightIndex++], element.weight0);
            element.weight120  = this.normalize(min, max[weightIndex++], element.weight120);
            element.weight240  = this.normalize(min, max[weightIndex++], element.weight240);
            element.weight360  = this.normalize(min, max[weightIndex++], element.weight360);
            element.weight480  = this.normalize(min, max[weightIndex++], element.weight480);
            element.weight600  = this.normalize(min, max[weightIndex++], element.weight600);
            element.weight720  = this.normalize(min, max[weightIndex++], element.weight720);
            element.weight840  = this.normalize(min, max[weightIndex++], element.weight840);
            element.weight960  = this.normalize(min, max[weightIndex++], element.weight960);
            element.weight1080  = this.normalize(min, max[weightIndex++], element.weight1080);
            element.weight1200  = this.normalize(min, max[weightIndex++], element.weight1200);
            element.weight1320  = this.normalize(min, max[weightIndex++], element.weight1320);
            weightIndex = 0;
            newMax[weightIndex] = this.compareMax(newMax[weightIndex++], element.weight0);
            newMax[weightIndex] = this.compareMax(newMax[weightIndex++], element.weight120);
            newMax[weightIndex] = this.compareMax(newMax[weightIndex++], element.weight240);
            newMax[weightIndex] = this.compareMax(newMax[weightIndex++], element.weight360);
            newMax[weightIndex] = this.compareMax(newMax[weightIndex++], element.weight480);
            newMax[weightIndex] = this.compareMax(newMax[weightIndex++], element.weight600);
            newMax[weightIndex] = this.compareMax(newMax[weightIndex++], element.weight720);
            newMax[weightIndex] = this.compareMax(newMax[weightIndex++], element.weight840);
            newMax[weightIndex] = this.compareMax(newMax[weightIndex++], element.weight960);
            newMax[weightIndex] = this.compareMax(newMax[weightIndex++], element.weight1080);
            newMax[weightIndex] = this.compareMax(newMax[weightIndex++], element.weight1200);
            newMax[weightIndex] = this.compareMax(newMax[weightIndex++], element.weight1320);
            //console.log('new maxes ' + newMax);
            element.speciesId = speciesID;
        });
        // tslint:disable-next-line:prefer-const
        const toAdd = [];
        newMax.forEach(individualMax => {
            toAdd.push(1 - individualMax);
        });
        //console.log('to add ' + toAdd);
        weightedData.forEach(element => {
            let weightIndex = 0;
            element.weight0 += toAdd[weightIndex++];
            element.weight120 += toAdd[weightIndex++];
            element.weight240 += toAdd[weightIndex++];
            element.weight360 += toAdd[weightIndex++];
            element.weight480 += toAdd[weightIndex++];
            element.weight600 += toAdd[weightIndex++];
            element.weight720 += toAdd[weightIndex++];
            element.weight840 += toAdd[weightIndex++];
            element.weight960 += toAdd[weightIndex++];
            element.weight1080 += toAdd[weightIndex++];
            element.weight1200 += toAdd[weightIndex++];
            element.weight1320 += toAdd[weightIndex++];
        });
        // add all weight to database
        const added = await this.animalCell.addAnimalCellsWeight(weightedData);
        return added;
    }
    private normalize(min, max, data) {
        // const delta = max - min;
        // const val = (data - min) / delta;
        // return max - data;
       return 1 - (data / max) ;
    }
    // returns greatest number
    private compareMax(currentMax, value) {
        if (value > currentMax) {
            return value;
        }
        return currentMax;
    }
    // Need to call this method to get a classification
    private getClassification(data, dataID) {
        const dataArray = [];
        let count = 0;
        // ..let temp = [38694, 38693, 38692];
        const total = 38680;
        dataID.forEach((cellID, index) => {
            dataArray.push(
                {
                    cellId: cellID,
                    weight0: this.classifier.getDistance(data[index * 12]),
                    weight120: this.classifier.getDistance(data[index * 12 + 1]),
                    weight240: this.classifier.getDistance(data[index * 12 + 2]),
                    weight360: this.classifier.getDistance(data[index * 12 + 3]),
                    weight480: this.classifier.getDistance(data[index * 12 + 4]),
                    weight600: this.classifier.getDistance(data[index * 12 + 5]),
                    weight720: this.classifier.getDistance(data[index * 12 + 6]),
                    weight840: this.classifier.getDistance(data[index * 12 + 7]),
                    weight960: this.classifier.getDistance(data[index * 12 + 8]),
                    weight1080: this.classifier.getDistance(data[index * 12 + 9]),
                    weight1200: this.classifier.getDistance(data[index * 12 + 10]),
                    weight1320: this.classifier.getDistance(data[index * 12 + 11]),
                }
            );

            count++;
            if (count % 100 === 0) {
                console.log('weight ' + count + ' of ' + total);
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

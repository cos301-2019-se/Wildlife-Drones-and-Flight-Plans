import { Injectable } from '@nestjs/common';
import { Classifier } from './animal-classifier.service';
import { AnimalLocationService } from '../services/animal-location.service';
//  Need to fetch the data
//  Need to train the classifier with the data
//  Need to be able to get classification
//  Need to store trained classifier in memory

@Injectable()
export class ClassifierTraining {
    private classifier: any;
    constructor(private readonly animalLocationService: AnimalLocationService) {
    }

    //  Trains the model
    // Fetch data from database then train on that data
    async trainModel(speciesName) {
        //  fetch data by species name
        const data = await this.animalLocationService.getSpeciesLocationTableData(speciesName);

        const jsonData = JSON.parse(JSON.stringify(data));
        const teachingData = [];
        jsonData.forEach(animal => {
            teachingData.push({
                month: parseInt(animal.month),
                time: parseInt(animal.time),
                temperature: parseInt(animal.temperature),
                distanceToRivers: parseFloat(animal.distanceToRivers),
                distanceToDams: parseFloat(animal.distanceToDams),
                distanceToRoads: parseFloat(animal.distanceToRoads),
                distanceToResidences: parseFloat(animal.distanceToResidences),
                distanceToIntermittentWater: parseFloat(animal.distanceToIntermittentWater),
                altitude: parseFloat(animal.altitude),
                slopiness: parseFloat(animal.slopiness)
            });
        });
        //  Populate classifer with teaching data
        this.classifier = new Classifier(teachingData);
    }

    getClassification(data) {
        return this.classifier.getDistance(data);
    }
}
const tf = require("@tensorflow/tfjs");
require("tfjs-node-save");
const fs = require('fs');
export class AnimalPredictionModel {
    private animalFile: any;
    private animalData: any;
    // Input data is input for machine learning
    private inputData = [{}];
    // Output data is outputs for machine to weight according to input data
    private outputData = [{}];
    constructor(animalJson) {
        this.animalFile = animalJson;
        this.fetchDataFromFile();
        this.organiseData();
    }

    // Fetches the data from the file
    private fetchDataFromFile() {
        try {
            this.animalData = JSON.parse(fs.readFileSync(this.animalFile));
        } catch (err) {
            console.log(err);
        }
        // console.log(JSON.stringify(this.animalData.length));
    }

    // Organises the data into inputs and outputs
    private organiseData()
    {
        this.animalData.forEach(animal => {
            if(animal.id != 0 && animal.id != (this.animalData.length - 1))
            {
                const animalInputObject = {
                    longitude: animal.longitude, // current animal longitude
                    latitude: animal.latitude, // current animal latitude
                    prevLongitude: this.animalData[animal.id - 1].longitude,
                    prevlatitude: this.animalData[animal.id - 1].latitude,
                };
                this.inputData.push(animalInputObject);
                const animalOutputObject = {
                    longitude: this.animalData[animal.id + 1].longitude,
                    latitude: this.animalData[animal.id + 1].latitude,
                };
                this.outputData.push(animalOutputObject);
            }
        });
    }
}
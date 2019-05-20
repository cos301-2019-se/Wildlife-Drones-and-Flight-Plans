import { Injectable } from '@nestjs/common';
import MLR from 'ml-regression-multivariate-linear';
import * as fs from 'fs';
@Injectable()
export class AnimalPredictionService {
    private model: any;
    private logsEnabled: boolean;
    constructor(logsEnabled= false){
        this.logsEnabled = logsEnabled;
    }
    // Trains the model with the inputs
    public trainModel(inputs, output) {
        try {
            this.model = new MLR(inputs, output);
            this.log('Model has been trained');
        } catch (err){
            throw err;
        }
    }
    // Saves a model to HDD 
    public saveModel(modelName) {
        try {
        const jsonModel = JSON.stringify(this.model.toJSON());
        fs.writeFileSync(modelName + '.json', jsonModel);
        this.log('Model has been saved');
        } catch (err) {
            throw err;
        }
    }

    // Loads a model from storage
    public loadModel(modelName) {
        try {
        const jsonModel =  fs.readFileSync(modelName + '.json');
        const tempModel = new MLR();
        this.model = tempModel.load(JSON.parse(tempModel));
        this.log('Model has been loaded');
        } catch (err) {
            throw err;
        }
    }

    // Logs messages
    private log(message)
    {
        if(this.logsEnabled === true)
        {
            console.log(message);
        }
    }

}
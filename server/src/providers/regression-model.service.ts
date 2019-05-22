import { Injectable } from '@nestjs/common';
const MLR = require('ml-regression-multivariate-linear');
import * as fs from 'fs';
@Injectable()
export class RegressionModel {
    private model: any;
    private logsEnabled: boolean;
    private inputs: any;
    private outputs: any;
    constructor() { }

    public enableLogs(logsEnabled)
    {
        this.logsEnabled = logsEnabled;
        this.log('Logs are enabled');
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

    // Prediction of the model
    public predict(inputs) {
        try {
            const predictions = this.model.predict(inputs);
            this.log('Model has predicted');
            return predictions;
        } catch (err) {
            throw err;
        }
    }

    // Saves a model to HDD 
    public saveModel(modelName) {
        try {
        const jsonModel = JSON.stringify(this.model.toJSON());
        fs.writeFileSync('ai_models/' + modelName + '.json', jsonModel);
        this.log('Model has been saved');
        } catch (err) {
            throw err;
        }
    }

    // Loads a model from storage
    public loadModel(modelName) {
        try {
            if(fs.existsSync('ai_models/' + modelName + '.json'))
            {
                const jsonModel =  fs.readFileSync('ai_models/' + modelName + '.json', 'utf8');
                this.model = MLR.load(JSON.parse(jsonModel));
                this.log('Model has been loaded');
                return this;
            } else {
                this.log('Model does not exist');
                return null;
            }
        } catch (err) {
            throw err;
        }
    }

    // Logs messages
    private log(message)
    {
        if (this.logsEnabled === true) {
            console.log(message);
        }
    }

}
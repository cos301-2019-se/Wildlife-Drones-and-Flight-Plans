const tf = require("@tensorflow/tfjs");
require("tfjs-node-save");
const fs = require('fs');
export class AnimalPredictionModel {
    private animalFile: any;
    private animalData: any;
    private model : any;
    private inputMax:any;
    private inputMin:any;
    private outputMax:any;
    private outputMin:any;

    // Input data is input for machine learning
    private formatedData = [];
     constructor(animalJson) {
        this.animalFile = animalJson;
        this.fetchDataFromFile();
        this.organiseData();
        //Create a model
        this.createModel();

        // put data into tensors
        const {inputs, outputs} = this.convertToTensor();
        
        this.trainModel(inputs, outputs).then(res=>{
            console.log('Final Accuracy',res.history.acc);
            const [xs, preds] = tf.tidy(() => {
    
                const xs = tf.linspace(0, 1, 400);
                const preds = this.model.predict(xs.reshape([100, 4]));      
                
                const unNormXs = xs
                  .mul(this.inputMax.sub(this.inputMin))
                  .add(this.inputMin);
                
                const unNormPreds = preds
                  .mul(this.outputMax.sub(this.outputMin))
                  .add(this.outputMin);
                
                // Un-normalize the data
                return [unNormXs.dataSync(), unNormPreds.dataSync()];
              });
        });
        // Once our data has been converted we must train model on the data
    }

    private saveModel(){
        this.model.save("file://./animalPredictionModel");
    }
    //Trains the model
    private async trainModel(inputs, outputs){
        return await this.model.fit(inputs , outputs ,{
            epochs: 2,
            batchSize: 2000,
            validationSplit : 0.20,
        });
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
                    prevLatitude: this.animalData[animal.id - 1].latitude,
                    nextLongitude: this.animalData[animal.id + 1].longitude,
                    nextLatitude: this.animalData[animal.id + 1].latitude,
                };
                this.formatedData.push(animalInputObject);
            }
        });
    }
    private convertToTensor(){
        return tf.tidy(() => {
            const jsonData = this.formatedData;
            // const jsonData = JSON.parse(this.formatedData.toString());
            // Step 1. Shuffle the data
            tf.util.shuffle(jsonData);

            // Step 2. Seperate the data into inputs and outputs
            const inputs = (jsonData.map(data => [
              data.longitude , data.latitude, data.prevLongitude , data.prevLatitude,
            ]));
            const outputs = (jsonData.map(data => [
              data.nextLongitude, data.nextLatitude,
            ]));
            const inputTensor = tf.tensor2d(inputs, [inputs.length, 4]);
            const outputTensor = tf.tensor2d(outputs, [outputs.length, 2]);
            // Step 3. Normalize the data to the range 0 - 1 using min-max scaling
            const inputMax = inputTensor.max();
            const inputMin = inputTensor.min();
            const outputMax = outputTensor.max();
            const outputMin = outputTensor.min();
            this.inputMin = inputMin;
            this.outputMin = outputMin;
            this.inputMax = inputMax;
            this.outputMax = outputMax;
            const normalizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin));
            const normalizedOutputs = outputTensor.sub(outputMin).div(outputMax.sub(outputMin));
            return {
                inputs: normalizedInputs,
                outputs: normalizedOutputs,
            }
        });
    }
    // Create our ML model
    private createModel() {
        this.model = tf.sequential();
        // Input shape will be 4 because of inputs
        // units is the amount of "neurons" in our hidden layer
        const hiddenLayer1 = tf.layers.dense({ units: 32, inputShape: [4], useBias: true });
        this.model.add(hiddenLayer1);
        // Our second hidden layer
        const hiddenLayer2 = tf.layers.dense({ units: 16, useBias: true });
        this.model.add(hiddenLayer2);
        // output layer will have 2 outputs.Next coordinates
        const outputLayer = tf.layers.dense({ units: 2, useBias: true });
        this.model.add(outputLayer);

        // The rate at which the ML model will learn
        const learningRate = 0.1;
        this.model.compile({
            optimizer: tf.train.adam(learningRate),
            loss: tf.losses.meanSquaredError,
            // We want to know the accuracy of the ai instead of the loss. Easier for human to read accuracy than loss
            metrics: ['accuracy']
        });
    }
}
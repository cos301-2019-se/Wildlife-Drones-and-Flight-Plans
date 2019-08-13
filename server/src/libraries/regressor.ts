const MLR = require('ml-regression-multivariate-linear');

export class Regressor {
  private model: any;

  constructor(json?) {
    if (json) {
      this.model = MLR.load(JSON.parse(json));
    }
  }

  public static fromJSON(json: string) {
    return new Regressor(json);
  }

  /**
   * Train the model off of the given inputs and outputs
   * @param inputs A set of input dimensions e.g. [[1, 2, 3], [3, 4, 5]]
   * @param output A set of output dimensions e.g. [[2], [4]]
   */
  public trainModel(inputs: number[][], output: number[][]) {
    this.model = new MLR(inputs, output);
  }

  /**
   * Predict a set of inputs
   * @param inputs A set of dimensions. Should match the trained data
   */
  public predict(inputs: number[][]) {
    const predictions = this.model.predict(inputs);
    return predictions;
  }

  public toJSON() {
    return this.model.toJSON();
  }
}

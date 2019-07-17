const { kdTree } = require('../libraries/kd-tree');

/**
 * Standardizes elements of an array after being added
 * without having to do n interations
 */
class Standardizer {
    private n: any;
    private sum: any;
    private sumOfSquared: any;
    constructor(numbers) {
        this.n = numbers.length;

        this.sum = numbers.reduce((sum, x) => sum + x, 0);
        this.sumOfSquared = numbers.reduce((sum, x) => sum + x * x, 0);
    }

    standardizeExisting(existingValue) {
        const stdev = Math.sqrt((this.sumOfSquared - (this.sum * this.sum / this.n)) / this.n);
        return (existingValue - this.sum / this.n) / stdev;
    }

    /**
     * Standardize a value that we assume to be in the array
     * before adding the new value.
     * @param {*} existingValue 
     * @param {*} valueAdded 
     */
    standardizeExistingAdded(existingValue, valueAdded) {
        const parameters = this._getParameters(valueAdded);
        return (existingValue - parameters.mean) / parameters.stdev;
    }

    /**
     * Returns the standardized value of a value not already
     * in the array.
     * @param {*} value 
     */
    standardizeNew(value) {
        const parameters = this._getParameters(value);
        return (value - parameters.mean) / parameters.stdev;
    }

    /**
     * Gets the parameters for standardization.
     * Imagines we added the value to the list of numbers
     * and then calculate the mean and standard deviation
     * for that virtual list.
     * @param {*} value 
     */
    _getParameters(value) {
        const sumOfSquared = this.sumOfSquared + value * value;
        const sum = this.sum + value;
        const n = this.n + 1;
        const mean = sum / n;

        const stdev = Math.sqrt((sumOfSquared - (sum * sum / n)) / n);

        return {
            mean,
            stdev
        };
    }
}

export class Classifier {
    private kd: any;
    /**
   * The constructor uses points to create a new classifier.
   */
    constructor(points) {
        const SAMPLE_SIZE = 20000;
        if (points.length > SAMPLE_SIZE) {
            const sample = [];
            for (let i = 0; i < SAMPLE_SIZE; i++) {
                sample.push(points[Math.floor(Math.random() * points.length)]);
            }
            points = sample;
        }

        const keys = Object.keys(points[0]);
        console.log('keys', keys);
        console.time('standardizers');
        const keyStandardizers = keys.reduce((ob, key) => {
            ob[key] = new Standardizer(points.map(point => point[key]));
            return ob;
        }, {});
        console.timeEnd('standardizers');

        this.kd = new kdTree(points, (a, b) => {
            return Math.sqrt(Object.keys(a).reduce((sum, key) => {
                const standardizer = keyStandardizers[key];
                const value = standardizer.standardizeExisting(a[key]) - standardizer.standardizeExisting(b[key]);
                sum += value * value;
                return sum;
            }, 0));
        }, keys);
    }

    /**
   * Adds cell data to map cell data table in database.
   * Gets the distance based on values.
   * We use this to determine probability of cell containing animal based on external factors
   * @param ob is the object the distance to is being measured 
   * @param n is the number of neigbours that should be visited
   */
    public getDistance(ob, n = 10) {
        const nearest = this.kd.nearest(ob, n);
        //console.log(nearest);
        return nearest.reduce((sum, pair) => sum + pair[1], 0) / n;
    }
}
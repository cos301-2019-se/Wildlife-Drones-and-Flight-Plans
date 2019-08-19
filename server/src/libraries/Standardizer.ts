/**
 * Utility class for Standardization
 * Provides efficient functions for adding a single
 * standardised value as well as standardising an entire array.
 */
export class Standardizer {
  private n: number;
  private sum: number;
  private sumOfSquared: number;
  private stdev: number;

  constructor(numbers) {
    this.n = numbers.length;

    this.sum = numbers.reduce((sum, x) => sum + x, 0);
    this.sumOfSquared = numbers.reduce((sum, x) => sum + x * x, 0);

    this.stdev = Math.sqrt((this.sumOfSquared - (this.sum * this.sum) / this.n) / this.n);
  }

  /**
   * Returns the array mapped to standardised values.
   * @param numbers The numbers to standardise. Assumes they are the same
   * as in the constructor.
   */
  public getStandardisedArray(numbers: number[]): number[] {
    return numbers.map(n => this.standardizeExisting(n));
  }

  /**
   * Performs simple standardization on a value
   * @param existingValue A value presumed to be in the array already
   */
  standardizeExisting(existingValue: number) {
    return (existingValue - this.sum / this.n) / this.stdev;
  }

  /**
   * Standardize a value that we assume to be in the array
   * before adding the new value.
   * @param existingValue
   * @param valueAdded
   */
  standardizeExistingAdded(existingValue: number, valueAdded: number) {
    const parameters = this.getParameters(valueAdded);
    return (existingValue - parameters.mean) / parameters.stdev;
  }

  /**
   * Returns the standardized value of a value not already
   * in the array.
   * @param value
   */
  standardizeNew(value: number) {
    const parameters = this.getParameters(value);
    return (value - parameters.mean) / parameters.stdev;
  }

  /**
   * Gets the parameters for standardization.
   * Imagines we added the value to the list of numbers
   * and then calculate the mean and standard deviation
   * for that virtual list.
   * @param value
   */
  private getParameters(value: number) {
    const sumOfSquared = this.sumOfSquared + value * value;
    const sum = this.sum + value;
    const n = this.n + 1;
    const mean = sum / n;

    const stdev = Math.sqrt((sumOfSquared - (sum * sum) / n) / n);

    return {
      mean,
      stdev,
    };
  }
}

/**
 * Using inter-quartile range, converts different percentiles
 * into values.
 * Example: All values less than the lower bound are made 1
 */
export class IQRIfy {
  private constructor() {}

  public static runOn(values: number[]): number[] {
    const sorted = values.concat([]).sort((a, b) => a - b);
    const lowerQuartile = sorted[Math.floor(sorted.length / 4)];
    const upperQuartile = sorted[sorted.length - Math.floor(sorted.length / 4)];

    const iqr = upperQuartile - lowerQuartile;
    const lower = lowerQuartile - iqr * 1.5;
    const upper = upperQuartile + iqr * 1.5;

    return values.map(value => {
      if (value < lower) {
        return 7 / 7;
      }
      if (value < (lower + lowerQuartile) / 2) {
        return 6 / 7;
      }
      if (value < lowerQuartile) {
        return 5 / 7;
      }
      if (value < (lowerQuartile + upperQuartile) / 2) {
        return 4 / 7;
      }
      if (value < upperQuartile) {
        return 3 / 7;
      }
      if (value < upper) {
        return 2 / 7;
      }
      return 1 / 7;
    });
  }
}

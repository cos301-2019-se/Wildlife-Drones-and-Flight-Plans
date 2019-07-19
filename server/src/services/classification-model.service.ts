import { kdTree } from '../libraries/kd-tree';
import { Standardizer } from '../libraries/Standardizer';

/**
 * Standardizes elements of an array after being added
 * without having to do n iterations
 */
export class Classifier {
  private kd: any;
  //  Creates the kd tree
  constructor(points, sampleSize = 10000) {
    if (sampleSize && points.length > sampleSize) {
      const sample = [];
      for (let i = 0; i < sampleSize; i++) {
        sample.push(points[Math.floor(Math.random() * points.length)]);
      }
      points = sample;
    }

    const keys = Object.keys(points[0]);
    // console.log('keys', keys);
    // console.time('standardizers');
    const keyStandardizers = keys.reduce((ob, key) => {
      ob[key] = new Standardizer(points.map(point => point[key]));
      return ob;
    }, {});
    // console.timeEnd('standardizers');

    this.kd = new kdTree(
      points,
      (a, b) => {
        return Math.sqrt(Object.keys(a).reduce((sum, key, keyIdx, keys) => {
          let value;

          if (key === 'time') {
            const standardizer = keyStandardizers[key];
            const aKey = a[key];
            const bKey = b[key];
            const delta = aKey - bKey;
            let unstandardizedValue = 0;
            if (delta > 720) {
              // Reverse the subtraction as we dont want a negative
              unstandardizedValue = 1440 - delta;
            } else if (delta < 0) {
              unstandardizedValue = delta * -1;
              if (unstandardizedValue > 720) {
                unstandardizedValue = 1440 - unstandardizedValue;
              }
            } else {
              unstandardizedValue = delta;
            }
            value = standardizer.standardizeExisting(unstandardizedValue);
          } else {
            const standardizer = keyStandardizers[key];
            value =
              standardizer.standardizeExisting(a[key]) -
              standardizer.standardizeExisting(b[key]);
          }

          return sum + value * value;
        }, 0));
      },
      keys,
    );
  }

  //  Gets the distance based on values.
  //  We use this to determine probability of cell containing animal based on external factors
  public getDistance(ob, n = 10) {
    const nearest = this.kd.nearest(ob, n);
    // console.log(nearest);
    return nearest.reduce((sum, pair) => sum + pair[1], 0) / n;
  }
}

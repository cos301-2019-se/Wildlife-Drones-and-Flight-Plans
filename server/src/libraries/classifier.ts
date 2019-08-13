import { kdTree } from './kd-tree';
import { Standardizer } from './Standardizer';

/**
 * Standardizes elements of an array after being added
 * without having to do n iterations
 */
export class Classifier {
  private kd: any;
  //  Creates the kd tree
  constructor(points, sampleSize = 20000) {
    // shuffle and take sample
    points = points.sort((a, b) => Math.random() - 0.5).slice(0, sampleSize);

    console.log('sample size', points.length);

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
        return Object.keys(a).reduce((sum, key, keyIdx, keys) => {
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
        }, 0);
      },
      keys,
    );
  }

  //  Gets the distance based on values.
  //  We use this to determine probability of cell containing animal based on external factors
  public getDistance(ob, n = 10) {
    const nearest = this.kd.nearest(ob, n);

    return nearest.reduce((sum, pair) => sum + pair[1], 0) / n;
  }
}

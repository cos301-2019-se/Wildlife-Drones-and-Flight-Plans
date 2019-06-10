import { kdTree } from '../libraries/kd-tree';
import explode from '@turf/explode';

const features = JSON.parse(
    `[
    {
      "type": "Feature", "properties": {},
      "geometry": {
        "type": "Polygon", "coordinates": [
          [[31.003417968749996, -22.874909909420122],
          [31.0089111328125, -22.965980167474097],
          [31.039123535156246, -22.99632330686715],
          [31.069335937499996, -22.986209684312335],
          [31.07208251953125, -22.895153032556724],
          [31.019897460937504, -22.879970973215112],
          [31.003417968749996, -22.874909909420122]
          ]]
      }
    }]`
);


const kd = new kdTree(
    features.reduce((points, feature) => {
        const featurePoints = explode(feature).features
            .map(point => {
                return {
                    x: point.geometry.coordinates[0],
                    y: point.geometry.coordinates[1],
                };
            });
        points.push(...featurePoints);
        return points;
    }, []),
    (a, b) => Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y)),
    ['x', 'y'],
);


describe('KD tree to JSON', () => {
    it('should be a json object', async () => {
        expect(kd.toJSON()).toEqual({ "dimension": 0, "left": { "dimension": 1, "left": { "dimension": 0, "left": null, "obj": { "x": 31.0089111328125, "y": -22.965980167474097 }, "parent": null, "right": null }, "obj": { "x": 31.003417968749996, "y": -22.874909909420122 }, "parent": null, "right": { "dimension": 0, "left": null, "obj": { "x": 31.003417968749996, "y": -22.874909909420122 }, "parent": null, "right": null } }, "obj": { "x": 31.019897460937504, "y": -22.879970973215112 }, "parent": null, "right": { "dimension": 1, "left": { "dimension": 0, "left": null, "obj": { "x": 31.039123535156246, "y": -22.99632330686715 }, "parent": null, "right": null }, "obj": { "x": 31.069335937499996, "y": -22.986209684312335 }, "parent": null, "right": { "dimension": 0, "left": null, "obj": { "x": 31.07208251953125, "y": -22.895153032556724 }, "parent": null, "right": null } } });
    });
});


describe('KD tree nearest function', () => {
    it('should be a JSON object with latatude, lonagatude and distance of the nearest point', async () => {
        expect(kd.nearest({
            x: 31.003417968749847,
            y: -22.874909909420234,
          }, 1)).toEqual([[{"x": 31.003417968749996, "y": -22.874909909420122}, 1.8758866506294801e-13]]);
    });
});

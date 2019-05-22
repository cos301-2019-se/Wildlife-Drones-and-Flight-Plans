import { GeoService,  GeoSearchSet } from './geo.service';

const geo = new GeoService();

describe('Overlapping geometry', () => {
  const mainSq = JSON.parse(`{"type":"Feature","properties":{},"geometry":
  {"type":"Polygon","coordinates":[[[30.498046875,-24.8864364907877],
  [31.354980468749996,-24.8864364907877],[31.354980468749996,
  -23.956136333969273],[30.498046875,-23.956136333969273],[30.498046875,-24.8864364907877]]]}}`);
  const outsideSq = JSON.parse(`{"type":"Feature","properties":{},
  "geometry":{"type":"Polygon","coordinates":[[[30.421142578125,
  -23.7048945023249],[31.201171875,-23.7048945023249],
  [31.201171875,-23.140359987886104],[30.421142578125,
  -23.140359987886104],[30.421142578125,-23.7048945023249]]]}}`);
  const overlapCornerSq = JSON.parse(`{"type":"Feature","properties":{},
  "geometry":{"type":"Polygon","coordinates":[[[30.234375,-24.287026865376422],
  [30.871582031249996,-24.287026865376422],[30.871582031249996,
  -23.51362636346272],[30.234375,-23.51362636346272],[30.234375,-24.287026865376422]]]}}`);
  const twoCornerOverlapSq = JSON.parse(`{"type":"Feature","properties":{},
  "geometry":{"type":"Polygon","coordinates":[[[30.157470703124996,
  -24.327076540018634],[31.61865234375,-24.327076540018634],
  [31.61865234375,-23.644524198573677],[30.157470703124996,
  -23.644524198573677],[30.157470703124996,-24.327076540018634]]]}}`);
  const fourCornerOverlapSq = JSON.parse(`{"type":"Feature","properties":{},
  "geometry":{"type":"Polygon","coordinates":[[[30.157470703124996,-25.135339016130978],
  [31.57470703125,-25.135339016130978],[31.57470703125,-23.644524198573677],
  [30.157470703124996,-23.644524198573677],[30.157470703124996,-25.135339016130978]]]}}`);
  const edgeOverlapSq = JSON.parse(`{"type":"Feature","properties":{},
  "geometry":{"type":"Polygon","coordinates":[[[30.179443359375,-24.746831298412033],
  [30.794677734375,-24.746831298412033],[30.794677734375,-24.086589258228027],
  [30.179443359375,-24.086589258228027],[30.179443359375,-24.746831298412033]]]}}`);
  const twoEdgesOverlapSq = JSON.parse(`{"type":"Feature","properties":{},
  "geometry":{"type":"Polygon","coordinates":[[[30.278320312499996,-24.676969798202666],
  [31.5087890625,-24.676969798202666],[31.5087890625,-24.156778233303413],
  [30.278320312499996,-24.156778233303413],[30.278320312499996,-24.676969798202666]]]}}`);
  const insideSq = JSON.parse(`{"type":"Feature","properties":{},
  "geometry":{"type":"Polygon","coordinates":[[[30.596923828125,-24.73685348477068],
  [31.245117187499996,-24.73685348477068],[31.245117187499996,-24.126701958681668],
  [30.596923828125,-24.126701958681668],[30.596923828125,-24.73685348477068]]]}}`);

  it('should return false on non-overlapping polygons', () => {
    expect(geo.isInPolygon(outsideSq, mainSq)).toBe(false);
  });

  it('should return true on overlapping single vertex', () => {
    expect(geo.isInPolygon(overlapCornerSq, mainSq)).toBe(true);
  });

  it('should return true on overlapping two vertices', () => {
    expect(geo.isInPolygon(twoCornerOverlapSq, mainSq)).toBe(true);
  });

  it('should return true on overlapping all vertices', () => {
    expect(geo.isInPolygon(fourCornerOverlapSq, mainSq)).toBe(true);
  });

  it('should return true on overlapping single edge', () => {
    expect(geo.isInPolygon(edgeOverlapSq, mainSq)).toBe(true);
  });

  it('should return true on overlapping two edges', () => {
    expect(geo.isInPolygon(twoEdgesOverlapSq, mainSq)).toBe(true);
  });

  it('should return true on all vertices inside', () => {
    expect(geo.isInPolygon(insideSq, mainSq)).toBe(true);
  });
});

describe('Distance between 2 coordinates', () => {

  const pointA = [31.360124524875123, -24.890245167845470];
  const pointB = [31.351245784236458, -24.873457812457845];
  const pointC = [32.845754782478365, -24.124784583652477];
  const pointD = [30.423651247852364, -25.364364872159885];

  it('should return 2.070414641026035 on 31.360124524875123,-24.890245167845470 and 31.351245784236458,-24.873457812457845', () => {
    expect(geo.getDistance(pointA, pointB)).toEqual(2.070414641026035);
  });

  it('should return 280.7507413874539 on 32.845754782478365,-24.124784583652477 and 30.423651247852364,-25.364364872159885', () => {
    expect(geo.getDistance(pointC, pointD)).toEqual(280.7507413874539);
  });

  it('should return 172.73544034152187 on 31.360124524875123,-24.890245167845470 and 32.845754782478365,-24.124784583652477', () => {
    expect(geo.getDistance(pointA, pointC)).toEqual(172.73544034152187);
  });

  it('should return 0 on 31.360124524875123,-24.890245167845470 and 31.360124524875123,-24.890245167845470', () => {
    expect(geo.getDistance(pointA, pointA)).toEqual(0);
  });

  it('should return 2.070414641026035 on 31.351245784236458,-24.873457812457845 and 31.360124524875123,-24.890245167845470', () => {
    expect(geo.getDistance(pointB, pointA)).toEqual(2.070414641026035);
  });
});

describe('Distance in kilometer to distane in degrees', () => {

  const distanceA = 2.070414641026035;
  const distanceB = 280.7507413874539;
  const distanceC = 172.73544034152187;
  const distanceD = 0;

  it('should return 0.018619660480281425 on 2.070414641026035', () => {
    expect(geo.distanceToDegrees(distanceA)).toEqual(0.018619660480281425);
  });

  it('should return 2.524848588604988 on 280.7507413874539', () => {
    expect(geo.distanceToDegrees(distanceB)).toEqual(2.524848588604988);
  });

  it('should return 1.5534449903605567 on 172.73544034152187', () => {
    expect(geo.distanceToDegrees(distanceC)).toEqual(1.5534449903605567);
  });

  it('should return 0 on 0', () => {
    expect(geo.distanceToDegrees(distanceD)).toEqual(0);
  });
});

describe('Distance from point to polygon', () => {

  // {"type":"Polygon","coordinates":[[[30.498046875,-24.8864364907877],
  // [31.354980468749996,-24.8864364907877],[31.354980468749996,
  // -23.956136333969273],[30.498046875,-23.956136333969273],[30.498046875,-24.8864364907877]]]}

  // {
  //   "type": "Feature",
  //   "geometry": {
  //     "type": "Point",
  //     "coordinates": [125.6, 10.1]
  //   },
  //   "properties": {
  //     "name": "Dinagat Islands"
  //   }
  // }

  const pointA = [31.360124524875123, -24.890245167845470];

  //const pointA = JSON.parse('{"lat": 31.360124524875123,"lng": -24.890245167845470}');
  const polyA = JSON.parse('{"type":"Polygon","coordinates":[[[30.498046875,-24.8864364907877],' +
    '[31.354980468749996,-24.8864364907877],[31.354980468749996,-23.956136333969273],' +
    '[30.498046875,-23.956136333969273],[30.498046875,-24.8864364907877]]]}')
  let distanceC = 172.73544034152187;
  let distanceD = 0;

  const point = JSON.parse('{' +
    '"{type": "Point",' +
    '"coordinates": [125.6, 10.1]}'
  );

  it('should return 0.018619660480281425 ', () => {
    expect(geo.getDistanceToPoly(JSON.parse('{"lat":5,"lng":3}'), polyA)).toEqual(0.018619660480281425);
  });



  // it('should return 2.524848588604988 on 280.7507413874539', () => {
  //   expect(geo.distanceToDegrees(distanceB)).toEqual(2.524848588604988);
  // });

  // it('should return 1.5534449903605567 on 172.73544034152187', () => {
  //   expect(geo.distanceToDegrees(distanceC)).toEqual(1.5534449903605567);
  // });

  // it('should return 0 on 0', () => {
  //   expect(geo.distanceToDegrees(distanceD)).toEqual(0);
  // });
});

describe('Binding boxes overlap', () => {

  const bbxA = [30.498046875, -24.8864364907877, 31.354980468749996, -24.8864364907877];
  const bbxB = [30.421142578125, -23.7048945023249, 31.201171875, -23.7048945023249];
  const bbxC = [30.498046875, -24.88643648747, 31.354980465478, -24.8864364907877];

  it('should return true', () => {
    expect(geo.bboxesOverlap(bbxA, bbxB)).toBe(false);
  });

  it('should return true', () => {
    expect(geo.bboxesOverlap(bbxA, bbxA)).toBe(true);
  });

});

describe('Get bounding box', () => {

  const bbxA = JSON.parse(`{"type": "FeatureCollection","features": [
              {"type": "Feature","properties": {},"geometry": 
              {"type": "Polygon", "coordinates": [[[30.7562255859375,-23.02918734674458],
              [31.26708984375,-23.02918734674458],[31.26708984375,-22.700187924834427],
              [30.7562255859375,-22.700187924834427],[30.7562255859375,-23.02918734674458]]]}}]}`
  )

  it('should return [30.7562255859375,-23.02918734674458,31.26708984375,-22.700187924834427,]', () => {
    expect(geo.getBoundingBox(bbxA)).toEqual([30.7562255859375, -23.02918734674458,
      31.26708984375, -22.700187924834427,]);
  });

});

describe('Partition into grid', () => {

  const bbxA = JSON.parse(`{"type": "FeatureCollection","features": [
                {"type": "Feature","properties": {},"geometry": 
                {"type": "Polygon","coordinates": 
                [[[31.206665039062496,-22.471954507739213],
                [31.047363281250004,-22.507482299898438],
                [30.8660888671875,-23.195911787809486],
                [31.113281249999996, -23.770264160239776],
                [31.563720703125,-23.73004055946544],
                [31.497802734375,-23.180763583129433],
                [31.3604736328125,-22.654571520098994],
                [31.206665039062496,-22.471954507739213]]]}}]}`
  )

  it('should return [30.8660888671875, -23.770264160239776, 31.563720703125, -22.471954507739213,]', () => {
    expect(geo.getBoundingBox(bbxA)).toEqual([30.8660888671875, -23.770264160239776, 31.563720703125, -22.471954507739213,]);
  });

});

describe('Geo Search set', () => {


  const bbxA = `{"type": "FeatureCollection","features": [
        {"type": "Feature","properties": {},
        "geometry": {"type": "Polygon","coordinates": [
            [[31.003417968749996,-22.874909909420122],
              [31.0089111328125,-22.965980167474097],
              [31.039123535156246,-22.99632330686715],
              [31.069335937499996,-22.986209684312335],
              [31.07208251953125,-22.895153032556724],
              [31.019897460937504,-22.879970973215112],
              [31.003417968749996,-22.874909909420122]
            ]]}}]}`;
  const x = 31.04461669921875;
  const y = -22.965980167474097;

  const geoSearch = new GeoSearchSet(bbxA);

  it('should return [30.8660888671875, -23.770264160239776, 31.563720703125, -22.471954507739213,]', () => {
    expect(geoSearch.getNearest(x, y)).toEqual([30.8660888671875, -23.770264160239776, 31.563720703125, -22.471954507739213,]);
  });

});

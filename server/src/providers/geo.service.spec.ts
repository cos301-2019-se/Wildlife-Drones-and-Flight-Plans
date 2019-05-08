import { GeoService } from "./geo.service";

const geo = new GeoService();

describe('Overlapping geometry', () => {
  const mainSq = JSON.parse(`{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[30.498046875,-24.8864364907877],[31.354980468749996,-24.8864364907877],[31.354980468749996,-23.956136333969273],[30.498046875,-23.956136333969273],[30.498046875,-24.8864364907877]]]}}`);
  const outsideSq = JSON.parse(`{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[30.421142578125,-23.7048945023249],[31.201171875,-23.7048945023249],[31.201171875,-23.140359987886104],[30.421142578125,-23.140359987886104],[30.421142578125,-23.7048945023249]]]}}`);
  const overlapCornerSq = JSON.parse(`{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[30.234375,-24.287026865376422],[30.871582031249996,-24.287026865376422],[30.871582031249996,-23.51362636346272],[30.234375,-23.51362636346272],[30.234375,-24.287026865376422]]]}}`);
  const twoCornerOverlapSq = JSON.parse(`{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[30.157470703124996,-24.327076540018634],[31.61865234375,-24.327076540018634],[31.61865234375,-23.644524198573677],[30.157470703124996,-23.644524198573677],[30.157470703124996,-24.327076540018634]]]}}`);
  const fourCornerOverlapSq = JSON.parse(`{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[30.157470703124996,-25.135339016130978],[31.57470703125,-25.135339016130978],[31.57470703125,-23.644524198573677],[30.157470703124996,-23.644524198573677],[30.157470703124996,-25.135339016130978]]]}}`);
  const edgeOverlapSq = JSON.parse(`{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[30.179443359375,-24.746831298412033],[30.794677734375,-24.746831298412033],[30.794677734375,-24.086589258228027],[30.179443359375,-24.086589258228027],[30.179443359375,-24.746831298412033]]]}}`);
  const twoEdgesOverlapSq = JSON.parse(`{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[30.278320312499996,-24.676969798202666],[31.5087890625,-24.676969798202666],[31.5087890625,-24.156778233303413],[30.278320312499996,-24.156778233303413],[30.278320312499996,-24.676969798202666]]]}}`);
  const insideSq = JSON.parse(`{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[30.596923828125,-24.73685348477068],[31.245117187499996,-24.73685348477068],[31.245117187499996,-24.126701958681668],[30.596923828125,-24.126701958681668],[30.596923828125,-24.73685348477068]]]}}`);

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
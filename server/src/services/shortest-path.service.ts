import { Injectable } from '@nestjs/common';

@Injectable()
export class ShortestPathService {
  public getShortestPath(points) {
    return solve(points.map(point => new Point(point[0], point[1])))
      .map(i => points[i])
      .concat([points[0]]);
  }
}

function Path(points) {
  this.points = points;
  this.order = new Array(points.length);
  for (let i = 0; i < points.length; i++) {
    this.order[i] = i;
  }
  this.distances = new Array(points.length * points.length);
  for (let i = 0; i < points.length; i++) {
    for (let j = 0; j < points.length; j++) {
      this.distances[j + i * points.length] = distance(points[i], points[j]);
    }
  }
}
Path.prototype.change = function(temp) {
  // tslint:disable-next-line:one-variable-per-declaration
  const i = this.randomPos(),
    j = this.randomPos();
  const delta = this.delta_distance(i, j);
  if (delta < 0 || Math.random() < Math.exp(-delta / temp)) {
    this.swap(i, j);
  }
};
Path.prototype.size = function() {
  let s = 0;
  for (let i = 0; i < this.points.length; i++) {
    s += this.distance(i, (i + 1) % this.points.length);
  }
  return s;
};
Path.prototype.swap = function(i, j) {
  const tmp = this.order[i];
  this.order[i] = this.order[j];
  this.order[j] = tmp;
};
Path.prototype.delta_distance = function(i, j) {
  // tslint:disable-next-line:one-variable-per-declaration
  const jm1 = this.index(j - 1),
    jp1 = this.index(j + 1),
    im1 = this.index(i - 1),
    ip1 = this.index(i + 1);
  let s =
    this.distance(jm1, i) +
    this.distance(i, jp1) +
    this.distance(im1, j) +
    this.distance(j, ip1) -
    this.distance(im1, i) -
    this.distance(i, ip1) -
    this.distance(jm1, j) -
    this.distance(j, jp1);
  if (jm1 === i || jp1 === i) {
    s += 2 * this.distance(i, j);
  }
  return s;
};
Path.prototype.index = function(i) {
  return (i + this.points.length) % this.points.length;
};
Path.prototype.access = function(i) {
  return this.points[this.order[this.index(i)]];
};
Path.prototype.distance = function(i, j) {
  return this.distances[this.order[i] * this.points.length + this.order[j]];
};
// Random index between 1 and the last position in the array of points
Path.prototype.randomPos = function() {
  return 1 + Math.floor(Math.random() * (this.points.length - 1));
};

function solve(points, tempCoeff?, callback?) {
  const path = new Path(points);
  if (points.length < 2) {
    return path.order;
  } // There is nothing to optimize
  if (!tempCoeff) {
    tempCoeff = 1 - Math.exp(-10 - Math.min(points.length, 1e6) / 1e5);
  }
  const hasCallback = typeof callback === 'function';

  for (
    let temperature = 100 * distance(path.access(0), path.access(1));
    temperature > 1e-6;
    temperature *= tempCoeff
  ) {
    path.change(temperature);
    if (hasCallback) {
      callback(path.order);
    }
  }
  return path.order;
}

/**
 * Represents a point in two dimensions.
 * @class
 * @param {Number} x abscissa
 * @param {Number} y ordinate
 */
function Point(x, y) {
  this.x = x;
  this.y = y;
}

function distance(p, q) {
  // tslint:disable-next-line:one-variable-per-declaration
  const dx = p.x - q.x,
    dy = p.y - q.y;
  return Math.sqrt(dx * dx + dy * dy);
}

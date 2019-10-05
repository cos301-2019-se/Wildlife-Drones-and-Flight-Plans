import { Injectable } from '@angular/core';
import { Subject, Subscription } from 'rxjs';

@Injectable()
export class GeolocationService {
  protected subject = new Subject<Coordinates>();

  constructor() {
    this.startWatchingCoords();
  }

  protected startWatchingCoords() {
    navigator.geolocation.watchPosition(
      position => {
        this.subject.next(position.coords);
      },
      error => {
        this.subject.error(error);
      }
    );
  }

  subscribe(callback: (coords: Coordinates) => any): Subscription {
    return this.subject.subscribe(callback);
  }
}

@Injectable()
export class GeolocationMockService extends GeolocationService {
  protected startWatchingCoords() {
    let coordIndex = 0;
    setInterval(() => {
      const activeCoord = this.geolocationPath[coordIndex];

      this.subject.next({
        accuracy: 80 + (Math.random() - 0.5) * 100, // 80 - 150
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        latitude: activeCoord[1],
        longitude: activeCoord[0],
        speed: null,
      });

      coordIndex++;
      if (coordIndex === this.geolocationPath.length) {
        coordIndex = 0;
      }
    }, 4000);
  }

  // tslint:disable-next-line: member-ordering
  private line = [
    [
      31.750252246856693,
      -24.71564797276325
    ],
    [
      31.749672889709473,
      -24.71555051261986
    ],
    [
      31.748943328857425,
      -24.715492036497196
    ],
    [
      31.748256683349606,
      -24.715511528541143
    ],
    [
      31.74772024154663,
      -24.715706448812657
    ],
    [
      31.747376918792725,
      -24.71615476427884
    ],
    [
      31.747376918792725,
      -24.71664206186725
    ],
    [
      31.747376918792725,
      -24.717207324679876
    ],
    [
      31.747462749481205,
      -24.717948009996984
    ],
    [
      31.747570037841793,
      -24.71864970781054
    ],
    [
      31.747591495513912,
      -24.719234452966557
    ],
    [
      31.74739837646484,
      -24.719741229879535
    ],
    [
      31.74699068069458,
      -24.720306478617275
    ],
    [
      31.746475696563724,
      -24.720793759951363
    ],
    [
      31.74512386322021,
      -24.721807299014795
    ],
    [
      31.744673252105716,
      -24.72194373633524
    ],
    [
      31.744415760040283,
      -24.7223530473991
    ],
    [
      31.744201183319092,
      -24.722801338924306
    ],
    [
      31.74402952194214,
      -24.7234055553813
    ],
    [
      31.743793487548825,
      -24.723931806034066
    ],
    [
      31.743514537811283,
      -24.724419073172587
    ],
    [
      31.743063926696777,
      -24.72512073449985
    ],
    [
      31.74276351928711,
      -24.725627487442114
    ],
    [
      31.742441654205322,
      -24.725919843969965
    ],
    [
      31.74226999282837,
      -24.726231690175833
    ],
    [
      31.74214124679565,
      -24.72681639970516
    ],
    [
      31.74224853515625,
      -24.72738161630481
    ],
    [
      31.742334365844723,
      -24.727946830336656
    ],
    [
      31.74246311187744,
      -24.728531531805366
    ],
    [
      31.742570400238037,
      -24.72917470024693
    ],
    [
      31.74263477325439,
      -24.72977888575396
    ],
    [
      31.74267768859863,
      -24.730480516853792
    ],
    [
      31.742870807647705,
      -24.731026227195482
    ],
    [
      31.74327850341797,
      -24.73157193514313
    ],
    [
      31.7435359954834,
      -24.73205917235907
    ],
    [
      31.743814945220944,
      -24.732565897039027
    ],
    [
      31.744179725646976,
      -24.733131087515943
    ],
    [
      31.74422264099121,
      -24.73369627542462
    ],
  ];
  private geolocationPath = this.line.concat(this.line.slice().reverse());
}

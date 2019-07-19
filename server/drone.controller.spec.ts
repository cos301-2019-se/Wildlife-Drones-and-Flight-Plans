import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../app.module';

jest.useFakeTimers();
jest.setTimeout(12000000);
let token;
describe('MapController (e2e)', () => {
  let app;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/login (POST)', async () => {
    await request(app.getHttpServer())
      .post('/login')
      .send({
        email: 'gst@gmail.com',
        password: '123',
      })
      .then(response => {
        // console.log("The token that is given back " + response.body.accessToken)

        token = response.body.accessToken;
      });
  });


  it('/addDrone (POST)', async () => {
    await request(app.getHttpServer())
      .post('/addDrone')
      .send({
        name: 'poach2',
        avgSpeed: '60',
        avgFlightTime:'120',
        speed: '80',
        flightTime: '76',
        lon: '1234.33',
        lat: '12367.66'
      }).set('Authorization', `Bearer ${token}`)
      .expect('true');
  });


  it('/updateDrone (POST)', async () => {
    await request(app.getHttpServer())
      .post('/updateDrone')
      .send({
        id: '1',
        name: 'poach2',
        avgSpeed: '60',
        avgFlightTime:'120',
        speed: '80',
        flightTime: '76',
        lon: '1234.33',
        lat: '12367.66'
      }) .set('Authorization', `Bearer ${token}`)
      .expect('true');
  });

  it('/deactivateDrone (POST)', async () => {
    await request(app.getHttpServer())
      .post('/deactivateDrone')
      .send({
        id: '2',
      }) .set('Authorization', `Bearer ${token}`)
      .expect('true');
  });

});
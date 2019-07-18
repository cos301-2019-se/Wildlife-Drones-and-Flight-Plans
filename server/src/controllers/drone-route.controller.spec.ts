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
        password: 'Reddbull@1',
      })
      .then(response => {
        // console.log("The token that is given back " + response.body.accessToken)

        token = response.body.accessToken;
        console.log('got token', token);
      });
  });

  it('/addDroneRoute (POST)', async () => {
    await request(app.getHttpServer())
      .post('/addDroneRoute')
      .send({
        id: '3',
        points: '1227906',
      })
      .set('Authorization', `Bearer ${token}`)
      .expect('false');
  });

  // it('/updateDroneRoute (POST)', async () => {
  //   await request(app.getHttpServer())
  //     .post('/updateDroneRoute')
  //     .send({
  //       id: '3',
  //       points: '1228900',
  //       percent: '40'
  //     })
  //     .set('Authorization', `Bearer ${token}`)
  //     .expect('false');
  // });

  it('/deactivateDroneRoute (POST)', async () => {
    await request(app.getHttpServer())
      .post('/deactivateDroneRoute')
      .send({
        id: '3',
      })
      .set('Authorization', `Bearer ${token}`)
      .expect('true');
  });

});
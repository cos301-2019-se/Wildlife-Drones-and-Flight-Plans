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
       // console.log('got token', token);
      });
  });

  it('/addPoachingIncidentType (POST)', async () => {
    await request(app.getHttpServer())
      .post('/addPoachingIncidentType')
      .send({
        poachingType: "snare"
      })
      .set('Authorization', `Bearer ${token}`)
      .expect('false');
  });
});

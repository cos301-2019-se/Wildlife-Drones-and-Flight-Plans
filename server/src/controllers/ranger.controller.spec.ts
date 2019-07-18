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

  it('/addRanger (POST)', async () => {
    await request(app.getHttpServer())
      .post('/addRanger')
      .send({
        lon: '1233.56',
        lat: '6012.45',
        rangerID:'19'
      })
      .set('Authorization', `Bearer ${token}`)
      .expect('true');
  });

  it('/updateRangerLocation (POST)', async () => {
    await request(app.getHttpServer())
      .post('/updateRangerLocation')
      .send({
        lon: '32323',
        lat: '1232.0',
        rangerID:'18'
      })
      .set('Authorization', `Bearer ${token}`)
      .expect('true');
  });


});
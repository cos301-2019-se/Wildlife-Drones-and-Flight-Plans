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

  it('/addUser (POST)', async () => {
    await request(app.getHttpServer())
      .post('/addUser')
      .send({
        name: 'Anne',
        username: 'jm',
        password: 'Reddbull@1',
        job: 'ranger',
        email: 'gst@gmail.com',
      })
      .expect('true');
  });

  it('/addUser (POST)', async () => {
    await request(app.getHttpServer())
      .post('/addUser')
      .send({
        name: 'Anne',
        username: 'jm',
        password: '123',
        job: 'Pilot',
        email: 'gst@gmail.com',
      })
      .expect('false');
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

  // it('/map/update (POST)', () => {
  //   return request(app.getHttpServer())
  //     .post('/map/update')
  //     .set('Authorization',`Bearer ${token}`)
  //     .send({
  //       name : "Rietvlei Nature Reserve"
  //     })
  //     .expect(201);
  // });

  it('/map/shortest-path (POST)', async () => {
    const points = [[8, 5], [2, 2], [13, 16], [22, 27], [6, 90]];
    const result = [[8, 5], [2, 2], [6, 90], [22, 27], [13, 16], [8, 5]];
    const res = await request(app.getHttpServer())
      .post('/map/shortest-path')
      .set('Authorization', `Bearer ${token}`)
      .expect(201)
      .send({
        points,
      });

    expect(
      JSON.stringify(res.body) === JSON.stringify(result) ||
        JSON.stringify(res.body) === JSON.stringify(result.reverse()),
    ).toBeTruthy();
  });
});

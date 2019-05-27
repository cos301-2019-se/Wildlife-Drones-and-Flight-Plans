import { Test, TestingModule } from '@nestjs/testing';

import * as request from 'supertest';
import { AppModule } from '../app.module';

jest.useFakeTimers();
jest.setTimeout(12000000);
let token;
describe('Authorization service', () => {
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
        password: '123',
        job: 'Pilot',
        email: 'gst@gmail.com',
      })
      .expect('true');
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
      .expect('true');
  });

  it('/getUsers)', () => {
    return request(app.getHttpServer())
      .get('/getUsers')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('/getUsers)', () => {
    return request(app.getHttpServer())
      .get('/getUsers')
      .expect(401);
  });
});

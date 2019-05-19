import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../app.module';

jest.useFakeTimers();
jest.setTimeout(30000);

describe('MapController (e2e)', () => {
  let app;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/map/update (POST)', () => {
    return request(app.getHttpServer())
      .post('/map/update')
      .send({
        top: -25.8415,
        left: 28.2560,
        bottom:  -25.9392,
        right: 28.3320,
      })
      .expect(201);
  });

  it('/map/shortest-path (POST)', async () => {
    const points = [[8, 5], [2, 2], [13, 16], [22, 27], [6, 90]];
    const result = [[8, 5], [2, 2], [6, 90], [22, 27], [13, 16], [8, 5]];
    const res = await request(app.getHttpServer())
      .post('/map/shortest-path')
      .send({
        points,
      });

    expect(
      JSON.stringify(res.body) == JSON.stringify(result) ||
      JSON.stringify(res.body) == JSON.stringify(result.reverse())
    ).toBeTruthy();
  });
});

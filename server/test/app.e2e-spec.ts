import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import {ShortestPathService}  from './../src/providers/shortest-path.service';

describe('AppController (e2e)', () => {
  let app;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  
});



const points = [{x: 5, y: 8},{x: 3, y: 2}];
const expectedPath = [{x: 5, y: 8},{x: 3, y: 2}, {x: 5, y: 8}];

test('Verifies shortest path is working', () => {
    expect(shortestPath.getShortestPath(points).toBe(expectedPath));
  });

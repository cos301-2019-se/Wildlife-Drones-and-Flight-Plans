import { Test, TestingModule } from '@nestjs/testing';

import * as request from 'supertest';
import { AppModule } from '../app.module';

import { providers } from '../app.providers'; 
import { imports } from '../app.imports';
import { controllers } from '../app.controllers';
import { AuthService } from '../auth/auth.service';

jest.useFakeTimers();
jest.setTimeout(12000000);
let token;
describe('Auth service  (e2e)', async () => {
  let app;
  let controller;

   beforeAll(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports:imports,
        controllers: controllers,
        providers:providers
      }).compile();
    
      controller = await module.get<AuthService>(AuthService);
      //const con = await controller.getConnection();
      //const auth = await con.getRepository(AuthService);
    

    app = module.createNestApplication();
    await app.init();

    token = await controller.createToken('reinhardt.eiselen@gmail.com')
  //  console.log('************************ ',token.accessToken)
  });

  it('/addUser (POST)', async () => {
    await request(app.getHttpServer())
      .post('/addUser')
      .send({
        name: 'Anne',
        username: 'jm',
        password: 'Reddbull@1',
        job: 'pilot',
        email: 'gst@gmail.com',
      })
      .expect(401);
  });

  it('/login (POST)', async () => {
    await request(app.getHttpServer())
      .post('/loginEmail')
      .send({
        email: 'gst@gmail.com',
      })
      .expect('true')
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
      }) .set('Authorization', `Bearer ${token.accessToken}`)
      .expect('true');
  });

  it('/getUsers)', () => {
    return request(app.getHttpServer())
      .post('/getUsers')
      .set('Authorization', `Bearer ${token.accessToken}`)
      .expect(201);
  });

  it('/getUsers)', () => {
    return request(app.getHttpServer())
      .post('/getUsers')
      .expect(401);
  });
});

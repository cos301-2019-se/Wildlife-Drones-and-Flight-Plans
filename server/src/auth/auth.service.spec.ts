import { Test, TestingModule } from '@nestjs/testing';

import * as request from 'supertest';
import { AppModule } from '../app.module';

import { providers } from '../app.providers'; 
import { imports } from '../app.imports';
import { controllers } from '../app.controllers';
import { AuthService } from '../auth/auth.service';

jest.useFakeTimers();
jest.setTimeout(12000000);
let tokenAdmin;
let tokenUser
describe('Authorization/validation & Authentication tests (e2e)', async () => {
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

    tokenAdmin = await controller.createToken('reinhardt.eiselen@gmail.com')
    tokenUser = await controller.createToken('evans.matthew97@gmail.com')
  //  console.log('************************ ',token.accessToken)
  });

  it('/addUser (should return 401,unauthorized access (pilot profile)', async () => {
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

  it('/addUser (should return 201, created (admin profile) ', async () => {
    await request(app.getHttpServer())
      .post('/addUser')
      .send({
        name: 'Anne',
        username: 'jm',
        password: 'Reddbull@1',
        job: 'pilot',
        email: 'gst@gmail.com',
      }).set('Authorization', `Bearer ${tokenAdmin.accessToken}`)
      .expect(201);
  });

  it('/loginEmail (Given a valid email should pass first step)', async () => {
    await request(app.getHttpServer())
      .post('/loginEmail')
      .send({
        email: 'gst@gmail.com',
      })
      .expect('true')
  });

  it('/loginEmail (Given an invalid email should fail at first step)', async () => {
    await request(app.getHttpServer())
      .post('/loginEmail')
      .send({
        email: 'a@gmail.com',
      })
      .expect('false')
  });


  it('/getUsers Should be succesful with valid Bearer token attached & Admin Profile)', () => {
    return request(app.getHttpServer())
      .post('/getUsers')
      .set('Authorization', `Bearer ${tokenAdmin.accessToken}`)
      .expect(201);
  });

  it('/getUsers Should fail without token )', () => {
    return request(app.getHttpServer())
      .post('/getUsers')
      .expect(401);
  });

  it('/getUsers Should fail with token but invalid profile (normal user profile) )', () => {
    return request(app.getHttpServer())
      .post('/getUsers')
      .set('Authorization', `Bearer ${tokenUser.accessToken}`)
      .expect(403);
  });
});

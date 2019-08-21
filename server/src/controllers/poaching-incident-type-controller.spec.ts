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
describe('Poaching-incident-type controller (e2e)', async () => {
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
    //console.log('************************ ',token.accessToken)
  });


  it('/addPoachingIncidentType (POST)', async () => {
    await request(app.getHttpServer())
      .post('/addPoachingIncidentType')
      .send({
        poachingType: "snare"
      })
      .set('Authorization', `Bearer ${token.accessToken}`)
      .expect('true');
  });
});

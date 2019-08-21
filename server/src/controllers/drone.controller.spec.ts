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
describe('Drone route  (e2e)', async () => {
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
   // console.log('************************ ',token.accessToken)
  });
  

  it('/addDrone (POST)', async () => {
    await request(app.getHttpServer())
      .post('/addDrone')
      .send({
        name: 'poach2',
        avgSpeed: '60',
        avgFlightTime:'120',
        speed: '80',
        flightTime: '76',
        lon: '1234.33',
        lat: '12367.66'
      })
      .set('Authorization', `Bearer ${token.accessToken}`)
      .expect('true');
  });


  it('/updateDrones (POST)', async () => {
    await request(app.getHttpServer())
      .post('/updateDrones')
      .send([{
        id: '2',
        name: 'poach2',
        avgSpeed: '60',
        avgFlightTime:'120',
        speed: '80',
        flightTime: '76',
        lon: '1234.33',
        lat: '12367.66'
      }])
      .set('Authorization', `Bearer ${token.accessToken}`)
      .expect('false');
  });

  it('/deactivateDrone (POST)', async () => {
    await request(app.getHttpServer())
      .post('/deactivateDrone')
      .send({
        id: '2',
      })
      .set('Authorization', `Bearer ${token.accessToken}`)
      .expect('true');
  });

});
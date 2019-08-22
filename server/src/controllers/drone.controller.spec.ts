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
describe('Drone route Controller (integration tests) (e2e)', async () => {
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
  

  it('/addDrone Add a new drone to the System  using valid token => should succeed', async () => {
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

  it('/addDrone Add a new drone to the System should fail without token', async () => {
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
      .expect(401);
  });


  it('/updateDrones Modifies the route the drone is currently on', async () => {
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

  it('/deactivateDrone Deactivates a drone from the system', async () => {
    await request(app.getHttpServer())
      .post('/deactivateDrone')
      .send({
        id: '2',
      })
      .set('Authorization', `Bearer ${token.accessToken}`)
      .expect('true');
  });

  it('/getDrones returns a list of active drones => should succeed with valid token', async () => {
    await request(app.getHttpServer())
      .post('/getDrones')
      .send()
      .set('Authorization', `Bearer ${token.accessToken}`)
      .expect(201)
  });

  it('/getDrones returns a list of active drones => should fail without token', async () => {
    await request(app.getHttpServer())
      .post('/getDrones')
      .send()
      .expect(401)
  });

  it('/getDroneRoutes returns a list of drone routes => should suceed with valid token', async () => {
    await request(app.getHttpServer())
      .post('/getDroneRoutes')
      .send()
      .set('Authorization', `Bearer ${token.accessToken}`)
      .expect(201)
  });

  it('/getDroneRoutes returns a list of drone routes => should fail without token', async () => {
    await request(app.getHttpServer())
      .post('/getDroneRoutes')
      .send()
      .expect(401)
  });

  it('/setDroneRoute adds a new drone route => succeed with valid token', async () => {
    await request(app.getHttpServer())
      .post('/setDroneRoute')
      .send({
        id: '3',
        points: '1227906',
      })
      .set('Authorization', `Bearer ${token.accessToken}`)
      .expect('true');
  });

  it('/setDroneRoute adds a new drone route => fail without token', async () => {
    await request(app.getHttpServer())
      .post('/setDroneRoute')
      .send({
        id: '3',
        points: '1227906',
      })
     
      .expect(401);
  });

  it('/updateDroneRoute (POST)', async () => {
    await request(app.getHttpServer())
      .post('/updateDroneRoute')
      .send({
        id: '3',
        points: '1228900',
        percent: '40'
      })
      .set('Authorization', `Bearer ${token.accessToken}`)
      .expect('true');
  });

});
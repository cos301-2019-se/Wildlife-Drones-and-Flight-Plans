import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { AuthenticationService } from '../services/authentication.service';
import {HttpClient,HttpHeaders  } from '@angular/common/http';
const TOKEN_KEY = 'auth-token';
@Injectable({
  providedIn: 'root'
})
//This service wraps all api's with token
export class APIService {
  url = 'api url goes here';

  constructor(private authService:AuthenticationService,private storage:Storage,private http:HttpClient) { }

  //Calls the api function.Adds token.postData must be json object
  async callAPI(apiFunction,postData)
  {
      //Then get token
      const token = await this.authService.checkTokenLocalSync();
      //Once have token wrap api calls
      const httpOptions = {
        headers: new HttpHeaders({
          'Accept': 'application/json',
          'Content-Type':  'application/json',
          'Access-Control-Allow-Origin' : '*',
          'Access-Control-Allow-Methods': 'POST'
        })
      };

      postData.push({
        'Token':token
        });

      this.http.post(this.url+apiFunction, postData, httpOptions)
      .subscribe(data => {
        console.log(data['_body']);
       }, error => {
        console.log(error);
      });
  }

  //Validates token
  async ValidateToken()
  {
    //need to make call to validate token
  }

  //login api call
  login()
  {

  }
}

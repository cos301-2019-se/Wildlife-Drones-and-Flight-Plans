import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class RoutingServiceService {
  url = 'http://localhost:3000/';
  constructor(private http: HttpClient,) { }
  async getRoute()
  {
    const httpOptions = {
      headers: new HttpHeaders({
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET'
      })
    };
    return await this.http.get(this.url + 'getPredictionData', httpOptions).toPromise();
  }
  
}


import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { BehaviorSubject } from 'rxjs';
import { Platform } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
const TOKEN_KEY = 'accessToken';
const EMAIL_KEY = 'email';
@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  authenticationState = new BehaviorSubject(false);
  url = 'http://localhost:3000/';
  constructor(private storage: Storage, private plt: Platform, private http: HttpClient) {
    
  }

  //This validates users login details and fetches token for user
  async validateLogin(email, password) {
    //need to make call to validate token
    //Then get token
    const apiFunction = 'login';
    //Once have token wrap api calls
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
      
      }
      )};

    const postData = {
      'email': email,
      'password': password
    };
    const result = await this.http.post(this.url + apiFunction, postData, httpOptions).toPromise();
    return result;
  }

  //login and create token.Change state to true
  async login(email, password) {
    //need to get custom token
    //Save email
     this.validateLogin(email, password).then(async (res: any) => {
      if (res.accessToken != '') {
        console.log(res);
        let Token = await res.accessToken;
        await this.storage.set(TOKEN_KEY, res.accessToken).then(async () => {
          await this.storage.set(EMAIL_KEY, email).then( () => {
            this.authenticationState.next(true);
          });
        });
      }
      else {
        console.log('User does not exist');
        this.authenticationState.next(false);
      }
    }).catch(err => {
      console.log(JSON.stringify(err));
    });
     console.log("Token received from server side " + await this.storage.get(TOKEN_KEY));
  }

  //Remove token key
  logout() {
     this.storage.remove(TOKEN_KEY).then(() => {
      console.log('Removed Token');
       this.storage.remove(EMAIL_KEY).then(() => {
        console.log('Removed Email');
      });
      this.authenticationState.next(false);
    });
  }

  //Check if authenticated by viewing state of token key
  isAuthenticated() {
    return this.authenticationState.value;
  }
}
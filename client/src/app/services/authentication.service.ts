import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { BehaviorSubject } from 'rxjs';
import { Platform } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
const TOKEN_KEY = 'auth-token';
const EMAIL_KEY = 'email';
@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  authenticationState = new BehaviorSubject(false);
  url = 'http://localhost:3000/';
  constructor(private storage: Storage, private plt: Platform, private http: HttpClient) {
    //When platform ready check token
    this.plt.ready().then(() => {
      this.checkToken();
    });
  }

  //Checks if token exists then comapres token to api to see if valid.
  //This function will only be used when launching app
  checkToken() {
    //Check if token is set if not then kick.
    this.storage.get(TOKEN_KEY).then(token => {
      if (token) {
        //Check if email token is set
        this.storage.get(EMAIL_KEY).then(email => {
          if (email) {
            this.ValidateToken(token, email).then(res => {
              //If token valid
              if (res == true) {
                this.authenticationState.next(true);
              }
              else {
                this.authenticationState.next(false);
              }
            }).catch(err => {
              this.authenticationState.next(false);
            });
          }
          else {
            this.authenticationState.next(false);
          }
        });
      }
      else {
        this.authenticationState.next(false);
      }
    });
  }

  //This function takes a token and checks if token is valid according to user email
  async ValidateToken(token, email) {
    //need to make call to validate token
    //Then get token
    const apiFunction = 'vToken';
    //Once have token wrap api calls
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST'
      })
    };

    const postData = {
      'token': token,
      'email': email
    };
    const result = await this.http.post(this.url + apiFunction, postData, httpOptions).toPromise();
    return result;
  }

  async callAPI(apiFunction,postBody)
  {
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST'
      })
    };
    const token = await this.storage.get(TOKEN_KEY);
    if(token)
    {
      postBody.token = token;
      const result = await this.http.post(this.url + apiFunction, postBody, httpOptions).toPromise();
      return result;
    }
    else
    {
      this.authenticationState.next(false);
    }
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
        'Access-Control-Allow-Methods': 'POST'
      })
    };

    const postData = {
      'email': email,
      'password': password
    };
    const result = await this.http.post(this.url + apiFunction, postData, httpOptions).toPromise();
    return result;
  }

  //login and create token.Change state to true
  login(email, password) {
    //need to get custom token
    //Save email
    this.validateLogin(email, password).then((res: any) => {
      if (res.token != '') {
         this.storage.set(TOKEN_KEY, res.token).then(() => {
           this.storage.set(EMAIL_KEY, email).then(() => {
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

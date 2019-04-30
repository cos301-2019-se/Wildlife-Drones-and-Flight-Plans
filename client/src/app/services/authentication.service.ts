import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { BehaviorSubject } from 'rxjs';
import { Platform } from '@ionic/angular';

const TOKEN_KEY = 'auth-token';
@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  authenticationState = new BehaviorSubject(false);
  constructor(private storage: Storage, private plt: Platform) { 
    //When platform ready check token
    this.plt.ready().then(() => {
      this.checkToken();
    });
  }

  //Checks if token exists then comapres token to api to see if valid.
  //This function will only be used when launching app
  checkToken(){
    //Check if token is set if not then kick.
    this.storage.get(TOKEN_KEY).then(res => {
      if (res) {
        //if token set see if token is valid.
        this.authenticationState.next(true);
      }
      else
      {
        this.authenticationState.next(false);
      }
    })
  }

  //check if token exists locally and is set.Then returns set token.
  //This function is used to retrieve token for api calls
  async checkTokenLocalSync()
  {
      const token = await this.storage.get(TOKEN_KEY);
      if(token != null){
        return token;
      }
      else
      {
        this.authenticationState.next(false);
      }
  }
 
  //login and create token.Change state to true
  login() {
    //need to get custom token
    return this.storage.set(TOKEN_KEY, 'Bearer 1234567').then(() => {
      this.authenticationState.next(true);
    });
  }

  //Remove token key
  logout() {
    return this.storage.remove(TOKEN_KEY).then(() => {
      this.authenticationState.next(false);
    });
  }
 
  //Check if authenticated by viewing state of token key
  isAuthenticated() {
    return this.authenticationState.value;
  }
}

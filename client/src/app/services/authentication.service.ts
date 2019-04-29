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

  //Checks the token to see if it exists in local storage.If exists change auth state to true
  checkToken() {
    this.storage.get(TOKEN_KEY).then(res => {
      if (res) {
        this.authenticationState.next(true);
      }
    })
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

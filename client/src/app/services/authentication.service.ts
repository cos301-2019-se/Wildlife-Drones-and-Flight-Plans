import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

const TOKEN_KEY = 'accessToken';
const EMAIL_KEY = 'email';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  authenticationState = new BehaviorSubject(true); // assume logged in by default
  private readonly url = 'http://localhost:3000';

  constructor(
    private storage: Storage,
    private http: HttpClient,
  ) {
    this.validateToken();
  }

  /**
   * Sends a post request to the API at the given endpoint name.
   * Automatically attaches the stored token to the request if there is one.
   * @param endpointName The name of the endpoint (excluding the '/')
   * @param body The data to send to the api
   */
  async post(endpointName: string, body: any) {
    const httpOptions = {
      headers: new HttpHeaders({
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        Authorization: `Bearer ${await this.getToken()}`,
      }),
    };

    try {
      return await this.http.post(`${this.url}/${endpointName}`, body, httpOptions).toPromise();
    } catch (err) {
      if (err.status === 401) {
        // authentication error
        console.error('Not authenticated');
        this.authenticationState.next(false);
      } else {
        // some other error occurred
        throw err;
      }
    }
  }

  /**
   * Sends a get request to the API at the given endpoint name.
   * Automatically attaches the stored token to the request if there is one.
   * @param endpointName The endpoint name excluding '/'
   * @param params The query parameters to be appended to the url
   */
  async get(endpointName, params: {[key: string]: string}) {
    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: `Bearer ${await this.getToken()}`,
      }),
    };

    const paramsString = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');

    try {
      return await this.http.get(`${this.url}/${endpointName}?${paramsString}`, httpOptions).toPromise();
    } catch (err) {
      if (err.status === 401) {
        // authentication error
        console.error('Not authenticated');
        this.authenticationState.next(false);
      } else {
        // some other error occurred
        throw err;
      }
    }
  }

  /**
   * Validate user email and password, then store saved token
   * to storage.
   * @param email The user's email
   * @param password The user's password
   */
  async login(email: string, password: string) {
    // need to get custom token
    // Save email
    let res: any;
    try {
      res = await this.post('login', {
        email,
        password,
      });
    } catch (err) {
      console.error(err);
      throw err;
    }

    if (!res || !res.accessToken || res.accessToken === '') {
      console.log('User does not exist');
      this.authenticationState.next(false);
      return;
    }

    const token = res.accessToken;

    await this.storage.set(TOKEN_KEY, token);
    await this.storage.set(EMAIL_KEY, email);

    this.authenticationState.next(true);

    console.log('Token received from server side ', token);
  }

  /**
   * Clear the user's token and log out.
   */
  async logout() {
    await this.storage.remove(TOKEN_KEY);
    console.log('Removed Token');

    await this.storage.remove(EMAIL_KEY);
    console.log('Removed Email');

    this.authenticationState.next(false);
  }

  /// Check if authenticated by viewing state of token key
  isAuthenticated() {
    return this.authenticationState.value;
  }

  private async validateToken() {
    console.log('validating token');
    const token = await this.getToken();
    if (!token) {
      // token doesn't exist - don't bother checking validity
      console.log('token not set');
      this.authenticationState.next(false);
      return;
    }

    const res: any = await this.post('vToken', {
      email: await this.getEmail(),
      token,
    });
    console.log('validate token res:', res);

    this.authenticationState.next(res);
    return res;
  }


  /// Get the user's email from storage
  private async getEmail() {
    return await this.storage.get(EMAIL_KEY);
  }

  /// Get the API token from storage
  private async getToken() {
    return await this.storage.get(TOKEN_KEY);
  }
}

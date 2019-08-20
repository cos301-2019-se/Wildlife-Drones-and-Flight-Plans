import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

const TOKEN_KEY = 'accessToken';
const EMAIL_KEY = 'email';

export interface TokenStatus {
  status: boolean;
  jobType: 'pilot' | 'administrator' | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  authenticationState = new BehaviorSubject<TokenStatus>({
    status: true,
    jobType: 'pilot',
  }); // assume logged in by default
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
        this.authenticationState.next({ status: false, jobType: null });
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
  async get(endpointName, params: { [key: string]: string }) {
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
        this.authenticationState.next({ status: false, jobType: null });
      } else {
        // some other error occurred
        throw err;
      }
    }
  }

  /**
   * Validates the received password against the minimum password requirements.
   * Sends a boolean value as a response.
   * Matches a string of 8 or more characters.
   * That contains at least one digit.
   * At least one lowercase character.
   * At least one uppercase character.
   * And can contain some special characters.
   * @param password The user's password
   */
  passRequirements(password) {
    const re = /(?=^.{8,}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s)[0-9a-zA-Z!@#$%^&*()]*$/;
    // Test returns true of false
    return re.test(password);
  }

  /**
   * Validate user email and password, then store saved token
   * to storage.
   * @param email The user's email
   * @param password The user's password
   */
  async loginEmail(email: string): Promise<boolean> {
    let res: any;
    try {
      res = await this.post('loginEmail', {
        email,
      });
    } catch (err) {
      console.log('there was an error');
      console.error(err);
      throw err;
    }

    if (!res) {
      console.log('User does not exist');
      this.authenticationState.next({ status: false, jobType: null });
      return false;
    }

    //const token = res.accessToken;

    //await this.storage.set(TOKEN_KEY, token);
    await this.storage.set(EMAIL_KEY, email);

    //this.authenticationState.next(true);

    // console.log('Token received from server side ', token);
    return true;
  }

  async loginPin(password: string, otp: string, email: string): Promise<{
    status: boolean;
    message: string;
    token: string;
  }> {
    // need to get custom token
    // Save email
    let res: {
      status: boolean;
      message: string;
      token: string;
    };

    try {
      res = await this.post('loginPin', {
        otp,
        email,
        password,
      }) as any;
    } catch (err) {
      console.error(err);
      throw err;
    }

    if (!res.status) {
      this.authenticationState.next({ status: false, jobType: null });
      return res;
    }

    const token = res.token;
    await this.storage.set(TOKEN_KEY, token);

    await this.validateToken();

    return res;
  }


  async resetPassword(email: string, otp : string): Promise<boolean> {
    console.log("about to send post for reset")
    let res: any;
    try {
      res = await this.post('resetPassword', {
        email,
        otp
      });
    } catch (err) {
      console.log(err);
      throw err;
    }

    if(res){
      return true;
    }
    else{
      return false;
    }
  
  }

  /**
   * Clear the user's token and log out.
   */
  async logout() {
    await this.storage.remove(TOKEN_KEY);
    console.log('Removed Token');

    await this.storage.remove(EMAIL_KEY);
    console.log('Removed Email');

    this.authenticationState.next({ status: false, jobType: null });
  }

  /// Check if authenticated by viewing state of token key
  isAuthenticated() {
    return this.authenticationState.value.status;
  }

  /**
   * Checks that a token is valid, and gets a new token
   * back, resetting the expiry of the token
   */
  public async validateToken() {
    console.log('validating token');

    const token = await this.getToken();
    if (!token) {
      // token doesn't exist - don't bother checking validity
      console.log('token not set');
      this.authenticationState.next({ status: false, jobType: null });
      return;
    }

    // check the token with the server
    const res: any = await this.post('vToken', {
      email: await this.getEmail(),
      token,
    });
    console.log(res);

    // update our token - will be the same token as before if the status was false
    await this.storage.set(TOKEN_KEY, res.token);

    this.authenticationState.next({ status: res.status, jobType: res.jobType });

    return res.status;
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

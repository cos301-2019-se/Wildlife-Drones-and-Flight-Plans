import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from './../../services/authentication.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})

export class LoginPage implements OnInit {
  enteringEmail = true;

  enteredPassword: string;
  enteredEmail: string;
  enteredOTP: string;
  error;
  loggingIn = false;
  resetting = false;

  constructor(
    private authService: AuthenticationService,
    private router: Router,
  ) {
  }

  ngOnInit() {
  }

  async loginEmail() {
    this.loggingIn = true;
    this.error = 'Validating email...';

    try {
      const res = await this.authService.loginEmail(this.enteredEmail);
      console.log(res);
      if (!res) {
        this.error = 'Incorrect credentials';
        return;
      }

      this.error = 'A one time pin has been sent to your email';
      this.enteringEmail = false;
    } catch (err) {
      console.error(err);
      this.error = 'An unknown error occurred';
      return;
    } finally {
      this.loggingIn = false;
    }
  }

  async loginPin() {
    this.loggingIn = true;
    this.error = 'Checking credentials...';

    try {
      const res = await this.authService.loginPin(this.enteredPassword,this.enteredOTP,this.enteredEmail);
      if (!res) {
        this.error = 'Incorrect credentials';
      }
    } catch (err) {
      this.error = 'An unknown error occurred';
    }

    this.loggingIn = false;
  }

  
  async reset() {
    this.router.navigate(['reset-password']);
    console.log("it is being called");
    
  // this.resetting = true;
  // this.error = 'Checking credentials...';

  // try {
  //   const res = await this.authService.resetPasword(this.enteredEmail);
  //   if (!res) {
  //     this.error = 'Incorrect credentials';
  //   }
  // } catch (err) {
  //   this.error = 'An unknown error occurred';
  // }

  // this.resetting = false;
}
}


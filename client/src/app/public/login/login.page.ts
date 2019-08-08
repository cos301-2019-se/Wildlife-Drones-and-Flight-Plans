import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from './../../services/authentication.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  enteredPassword: string;
  enteredEmail: string;
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

  async login() {
    this.loggingIn = true;
    this.error = 'Checking credentials...';

    try {
      const res = await this.authService.login(this.enteredEmail, this.enteredPassword);
      if (!res) {
        this.error = 'Incorrect credentials';
      }
    } catch (err) {
      this.error = 'An unknown error occurred';
    }

    this.loggingIn = false;
  }

  
  async reset() {
    this.router.navigate(['reset-password'])
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


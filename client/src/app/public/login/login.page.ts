import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from './../../services/authentication.service';
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

  constructor(
    private authService: AuthenticationService,
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
}

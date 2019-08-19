import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from './../../services/authentication.service';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage implements OnInit {
  enteringEmail = true;

  enteredPassword: string;
  enteredEmail: string;
  enteredOTP: string;
  error;
  loggingIn = false;
  resetting = false;

  numOtpRetries = 3;

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private toastCtrl: ToastController,
  ) {}

  ngOnInit() {}

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

  async sendOTP() {
    try {
      await this.authService.loginEmail(this.enteredEmail);
      this.numOtpRetries--;
      const sentToast = await this.toastCtrl.create({
        message: `OTP sent to ${this.enteredEmail}`,
        duration: 15000,
      });
      sentToast.present();
    } catch (err) {
      const errorToast = await this.toastCtrl.create({
        message: 'An unknown error occurred',
        duration: 15000,
      });
      errorToast.present();
    }

    if (this.numOtpRetries <= 0) {
      const toast = await this.toastCtrl.create({
        message: 'OTP not sending?',
        buttons: [
          {
            text: 'Change email',
            handler: () => this.resetEmail(),
          }
        ],
      });

      toast.present();
    }
  }

  resetEmail() {
    this.enteredEmail = '';
    this.enteringEmail = true;
    this.numOtpRetries = 3;
    this.error = null;
  }

  async loginPin() {
    this.loggingIn = true;
    this.error = 'Checking credentials...';

    try {
      const res = await this.authService.loginPin(
        this.enteredPassword,
        this.enteredOTP,
        this.enteredEmail
      );
      if (!res.status) {
        this.error = res.message;
      }
    } catch (err) {
      this.error = 'An unknown error occurred';
    }

    this.loggingIn = false;
  }

  async reset() {
    // TODO: implementation
  }
}

import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from './../../services/authentication.service';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
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
    private alertCtrl: AlertController,
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

    this.presentPrompt();

    
    
    // TODO: implementation
  }

  async displayAlert() {
    const alert = await this.alertCtrl.create({
      message: 'Do you wish reset your password?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
            
          }
        },
        {
          text: 'Yes',
          handler: async () => {
            console.log('Yes clicked');
            const res = await this.authService.resetPassword(
              this.enteredEmail,
              this.enteredOTP
            );
            this.router.navigate(['login']);
          }
        }
      ]
    });
    await alert.present();
  }

  async presentPrompt() {
    const alert = await this.alertCtrl.create({
      message: 'Reset Confirm',
      inputs: [
        {
          name: 'OTP',
          placeholder: 'OTP'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
            
          }
        },
        {
          text: 'Confirm',
          handler: async (data) => {
            console.log('Yes clicked');
            const res = await this.authService.resetPassword(
              this.enteredEmail,
              data.OTP
            );
            if(!res) {
              const sentToast = await this.toastCtrl.create({
                message: `OTP was inccorect`,
                duration: 15000,
              });
              sentToast.present();
            }
            else{
              const sentToast = await this.toastCtrl.create({
                message: `Password has been reset, check your email`,
                duration: 15000,
              });
              sentToast.present();
            } 
            
            this.router.navigate(['login']);
          }
        }
       
      ]
    });
    await alert.present();
  }

  

}

import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from './../../services/authentication.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-reset',
  templateUrl: './password-reset.page.html',
  styleUrls: ['./password-reset.page.scss'],
})
export class passwordReset implements OnInit {
  enteringEmail = true;
  enteredEmail: string;
  enteredOTP: string;
  error;

  constructor(
    private authService: AuthenticationService,
    private router: Router,
  ) {
  }

  ngOnInit() {
  }

  async reset() {
      console.log("it is being called");
   // this.router.navigate(['login.page']);
    this.error = 'Checking credentials...';

    try {
      const res = await this.authService.resetPasword(this.enteredEmail);
      if (!res) {
        this.error = 'An email with a new password and OTP has been sent to your email.';
        this.enteringEmail = false;
      } else {
        //this.enteringEmail = false;
      }

    } catch (err) {
      this.error = 'An unknown error occurred';
    }
  }


  async resetConfirm() {
    console.log("it is being called the confirm reset");
    try {
      const res = await this.authService.resetPaswords(this.enteredEmail,this.enteredOTP);
      if (!res) {
        this.error = 'An email with a new password and OTP has been sent to your email.';
        this.enteringEmail = false;
      } else {
        //this.enteringEmail = false;
      }

    } catch (err) {
      this.error = 'An unknown error occurred';
    }
  

    this.router.navigate(['login']);
  }  
  

}

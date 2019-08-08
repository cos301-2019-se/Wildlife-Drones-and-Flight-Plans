import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from './../../services/authentication.service';
@Component({
  selector: 'app-reset',
  templateUrl: './password-reset.page.html',
  styleUrls: ['./password-reset.page.scss'],
})
export class passwordReset implements OnInit {
  enteredEmail: string;
  error;
  resetting = false;

  constructor(
    private authService: AuthenticationService,
  ) {
  }

  ngOnInit() {
  }

  async reset() {
      console.log("it is being called");
      
    this.resetting = true;
    this.error = 'Checking credentials...';

    try {
      const res = await this.authService.resetPasword(this.enteredEmail);
      if (!res) {
        this.error = 'Incorrect credentials';
      }
    } catch (err) {
      this.error = 'An unknown error occurred';
    }

    this.resetting = false;
  }
}

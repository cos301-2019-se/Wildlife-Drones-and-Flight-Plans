import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from './../../services/authentication.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  enteredPassword:string;
  enteredEmail:string;
  constructor(private authService:AuthenticationService) { 
  }

  ngOnInit() {
  }

   login() {
   // console.log(JSON.stringify(form));
    this.authService.login(this.enteredEmail,this.enteredPassword);
  }
}

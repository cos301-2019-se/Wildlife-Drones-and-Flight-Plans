import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from './../../services/authentication.service';
@Component({
  selector: 'app-test',
  templateUrl: './test.page.html',
  styleUrls: ['./test.page.scss'],
})
export class TestPage implements OnInit {

  constructor(private authService:AuthenticationService) { }

  ngOnInit() {
  }
  logout()
  {
    this.authService.logout();
  }
}

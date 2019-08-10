import { Component, OnInit } from '@angular/core';
import { UsersService } from '../../services/users.service';
@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
})
export class UsersPage implements OnInit {

  constructor(private userService:UsersService) { }

  async ngOnInit() {
    const res = await this.userService.getUsers();
    console.log(JSON.stringify(res));
  }

}

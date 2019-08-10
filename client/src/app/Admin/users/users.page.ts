import { Component, OnInit } from '@angular/core';
import { UsersService } from '../../services/users.service';
@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
})
export class UsersPage implements OnInit {
  users:any;
  constructor(private userService:UsersService) { }

  async ngOnInit() {
    this.users = await this.userService.getUsers();
    console.log(JSON.stringify(this.users));
  }

  selectUser(index:number)
  {
    //Get selected user then need to open up a new page
    const selectedUser = this.users[index];

  }

}

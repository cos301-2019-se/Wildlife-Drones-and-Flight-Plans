import { Component, OnInit } from '@angular/core';
import { UsersService } from '../../services/users.service';
import { Events } from '@ionic/angular';
import { Router } from '@angular/router';
@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
})
export class UsersPage implements OnInit {
  users:any;
  constructor(private userService:UsersService,public events: Events,private router: Router) { 
    this.events.subscribe('user:updated', () => {
      // user and time are the same arguments passed in `events.publish(user, time)`
      this.refresh();
    });
  }

  async refresh()
  {
    this.users = [];
    this.users = await this.userService.getUsers();
  }

  ngOnInit() {
    this.refresh();
  }

  selectUser(index:number)
  {
    //Get selected user then need to open up a new page
    const selectedUser = this.users[index];
    console.log(JSON.stringify(selectedUser));
    this.router.navigate(['edit-user',selectedUser]);
  }

  addUser()
  {
    this.router.navigate(['add-user'],{});
  }



}

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
    this.events.subscribe('user:deleted', (id, time) => {
      // user and time are the same arguments passed in `events.publish(user, time)`
      this.refresh();
    });
  }

  async refresh()
  {
    this.users = [];
    this.users = await this.userService.getUsers();
    console.log(JSON.stringify(this.users));
  }

  ngOnInit() {
    this.refresh();
  }

  ionViewDidEnter()
  {
    this.refresh();
  }

  selectUser(index:number)
  {
    //Get selected user then need to open up a new page
    const selectedUser = this.users[index];
    this.router.navigate(['edit-user'],{ state: { user:selectedUser } });
  }



}

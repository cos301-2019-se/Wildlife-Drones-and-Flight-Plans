import { Component, OnInit, Input } from '@angular/core';
import { UsersService } from '../../services/users.service';
import { Events } from '@ionic/angular';
@Component({
  selector: 'app-user-component',
  templateUrl: './user-component.component.html',
  styleUrls: ['./user-component.component.scss'],
})
export class UserComponentComponent implements OnInit {
  @Input('name') name:string;
  @Input('surname') surname:string;
  @Input('job') job:string;
  @Input('id') id:number;
  constructor(private userService:UsersService,public events: Events) { }

  ngOnInit() {}

  async deleteUser()
  {
    const result  = await this.userService.deleteUser(this.id);
    console.log("Deleted User:",result);
    if(result == true)
    {
      this.userDeletedEvent();
    }
  }

  userDeletedEvent() {
    this.events.publish('user:deleted', this.id, Date.now());
  }
}

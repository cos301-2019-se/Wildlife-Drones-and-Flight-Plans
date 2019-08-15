import { Component, OnInit } from '@angular/core';
import { ActivatedRoute,Router } from '@angular/router';
import { Events } from '@ionic/angular';
import { UsersService } from '../../services/users.service';
import { AlertController } from '@ionic/angular';
@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.page.html',
  styleUrls: ['./edit-user.page.scss'],
})
export class EditUserPage implements OnInit {
  user:any;
  tempUser:any = null;
  error;
  constructor(private alertCtrl:AlertController,private userService:UsersService,public events: Events,private router: Router,private activatedRoute:ActivatedRoute) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.user = params;
      this.tempUser = this.user;
    });
  }
async displayAlert(editUser)
{
  let alert = await this.alertCtrl.create({
    message: 'Do you wish to commit these changes?',
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
          await this.userService.updateUser(editUser);
          this.events.publish('user:updated');
          this.router.navigate(['admin-tabs/users']);
        }
      }
    ]
  });
  await alert.present();
}
  checkChanges()
  {
    let changes = false;
    if(this.user.name != this.tempUser.name)
    {
      changes = true;
    }
    else if(this.user.surname != this.tempUser.surname)
    {
      changes = true;
    }
    else if(this.user.email != this.tempUser.email)
    {
      changes = true;
    }
    else if(this.user.jobType != this.tempUser.jobType)
    {
      changes = true;
    }
    return changes;
  }

  async goBack()
  {
    if(this.tempUser != null)
    {
    const editUser = {
      id:this.tempUser.id,
      name:this.tempUser.name,
      surname:this.tempUser.surname,
      email:this.tempUser.email,
      job:this.tempUser.jobType
    }
    if(this.checkChanges())
    {
      await this.displayAlert(editUser);
    }
    else
    {
      //await this.userService.updateUser(editUser);
      //this.events.publish('user:updated');
      this.router.navigate(['admin-tabs/users']);
    }
  }
  else
  {
    this.router.navigate(['admin-tabs/users']);
  }
  }

  
  async deleteUser()
  {
    const result  = await this.userService.deleteUser(parseInt(this.user.id,10));
    if(result)
    {
      this.events.publish('user:updated');
      this.router.navigate(['admin-tabs/users']);
    }
    else
    {
      this.error = 'Failed to delete user';
    }
  }

}

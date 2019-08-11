import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService } from '../../services/users.service';
@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.page.html',
  styleUrls: ['./edit-user.page.scss'],
})
export class EditUserPage implements OnInit {
  user:any;
  constructor(private userService:UsersService,private router: Router) { }

  ngOnInit() {
    this.user = this.router.getCurrentNavigation().extras.state.user;
  }

  async goBack()
  {
    const editUser = {
      id:this.user.id,
      name:this.user.name,
      surname:this.user.surname,
      email:this.user.email,
      job:this.user.jobType
    }   
    await this.userService.updateUser(editUser);
    this.router.navigate(['users']);
  }

}

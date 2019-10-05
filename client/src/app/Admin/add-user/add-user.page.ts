import { Component, OnInit } from '@angular/core';
import { UsersService } from '../../services/users.service';
import { AuthenticationService } from './../../services/authentication.service';
import { Router } from '@angular/router';
import { Events } from '@ionic/angular';
import { FormGroup, Validators, FormControl } from '@angular/forms';
@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.page.html',
  styleUrls: ['./add-user.page.scss'],
})
export class AddUserPage implements OnInit {
  error;

  formGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    surname: new FormControl('', Validators.required),
    jobType: new FormControl('pilot', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
    confirmPassword: new FormControl('', Validators.required),
  }, {
    validators: [
      (group: FormGroup) => group.get('password').value === group.get('confirmPassword').value
        ? null : { passwordsDoNotMatch: true },
    ]
  });

  constructor(
    public events: Events,
    private userService: UsersService,
    private router: Router,
    private auth: AuthenticationService
  ) { }

  ngOnInit() {
  }

  async addUser() {
    if (!this.formGroup.valid) {
      // dont do anything
      this.error = 'Not all fields have been filled';
    } else if (this.formGroup.get('password').value !== this.formGroup.get('confirmPassword').value) {
      // password dont match
      this.error = 'Passwords do not match';
    } else if (!this.auth.passRequirements(this.formGroup.get('password').value)) {
      this.error = 'Password must be 8 characters and contain atleast 1 uppercase,1 lowercase,special character and a digit';
    } else {
      // insert
      const user = {
        id: 0,
        name: this.formGroup.get('name').value,
        surname: this.formGroup.get('surname').value,
        email: this.formGroup.get('email').value,
        job: this.formGroup.get('jobType').value,
      };

      await this.userService.addUser(user, this.formGroup.get('password').value);
      this.events.publish('user:updated');
      this.router.navigate(['admin-tabs/users']);
    }
  }

}

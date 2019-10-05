import { Injectable } from '@angular/core';
import { AuthenticationService } from './authentication.service';

export interface Users {
  id:number;
  name: string;
  surname: string;
  job: string;
  email:string;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private authService: AuthenticationService,) { }

  async getUsers(): Promise<Users> {
    const res = await this.authService.post('getUsers', {});
    return res as Users;//await this.authService.post('getUsers', {});
  }

  async deleteUser(id:number):Promise<Boolean> {
    const res = await this.authService.post('deactivateUser', {id});
    return res as Boolean;//await this.authService.post('getUsers', {});
  }

  async addUser(user:Users,pass:string):Promise<Boolean> {
    const name = user.name;
    const surname = user.surname;
    const email = user.email;
    const job = user.job;
    const password = pass;
    const res = await this.authService.post('addUser', {
      name,surname,email,job,password
    });
    return res as Boolean;//await this.authService.post('getUsers', {});
  }

  async updateUser(user:Users):Promise<Boolean> {
    const id = user.id;
    const name = user.name;
    const surname = user.surname;
    const email = user.email;
    const job = user.job;
    const res = await this.authService.post('updateUser', {
      id,
      name,surname,email,job
    });
    return res as Boolean;//await this.authService.post('getUsers', {});
  }


}

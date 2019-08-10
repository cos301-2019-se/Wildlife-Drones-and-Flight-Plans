import { Injectable } from '@angular/core';
import { AuthenticationService } from './authentication.service';

export interface Users {
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
}

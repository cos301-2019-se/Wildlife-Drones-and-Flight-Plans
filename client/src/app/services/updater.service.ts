import { Injectable } from '@angular/core';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class UpdaterService {
  constructor(
    private readonly authenticationService: AuthenticationService
  ) {}

  /**
   * Tells the server to train poaching model
   */
  updatePoachingModel(): Promise<any> {
    return this.authenticationService.get('trainClassificationModelPoaching', {});
  }

  /**
   * Tells the server to train animal model
   */
  updateAnimalModel(): Promise<any> {
    return this.authenticationService.get('trainClassificationModel', {});
  }
}

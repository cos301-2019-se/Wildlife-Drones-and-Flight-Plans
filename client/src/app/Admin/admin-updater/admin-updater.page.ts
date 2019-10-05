import { Component, OnInit } from '@angular/core';
import { UpdaterService } from '../../services/updater.service';
import { ToastController } from '@ionic/angular';
import { IncidentsService } from '../../services/incidents.service';

@Component({
  selector: 'app-admin-updater',
  templateUrl: './admin-updater.page.html',
  styleUrls: ['./admin-updater.page.scss'],
})
export class AdminUpdaterPage implements OnInit {

  public newIncidentType = '';

  constructor(
    private readonly updaterService: UpdaterService,
    private readonly toastCtrl: ToastController,
    private readonly incidentsService: IncidentsService,
  ) { }

  ngOnInit() {
  }

  updateAnimalModel() {
    this.updaterService.updateAnimalModel();
    this.toastCtrl.create({
      message: 'Updating. You will receive an email when done.',
      duration: 5000,
    }).then(toast => toast.present());
  }

  updatePoachingModel() {
    this.updaterService.updatePoachingModel();
    this.toastCtrl.create({
      message: 'Updating. You will receive an email when done.',
      duration: 5000,
    }).then(toast => toast.present());
  }

  addNewIncidentType() {
    this.incidentsService.addIncidentType(this.newIncidentType);
    this.newIncidentType = '';
  }

}

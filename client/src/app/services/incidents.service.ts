import { Injectable } from '@angular/core';
import { AuthenticationService } from './authentication.service';

export interface Incident {
  id?: number;
  type: number;
  timestamp: number;
  description: string;
  latitude: number;
  longitude: number;
}

@Injectable()
export class IncidentsService {
  constructor(
    private authService: AuthenticationService,
  ) {}

  async addIncident(typeId, descripton, lon, lat) {
    // TODO: Add incident using the server
  }

  async getIncidents() {
    // TODO: Get incidents from the server
    return [];
  }

  async getIncidentTypes() {
    // TODO: Get incident types from the server
    return [];
  }
}

@Injectable()
export class IncidentsMockService extends IncidentsService {
  private incidents: Incident[] = [
    {
      id: 1,
      type: 2,
      timestamp: Date.now() - 86400000 * 7,
      description: '',
      latitude: -25.913508215392703,
      longitude: 28.275890350341797,
    },
    {
      id: 2,
      type: 2,
      timestamp: Date.now() - 86400000 * 4,
      description: '',
      latitude: -25.87366586518875,
      longitude: 28.309192657470703,
    },
    {
      id: 3,
      type: 3,
      timestamp: Date.now() - 86400000 * 2.5,
      description: '',
      latitude: -25.88470879377305,
      longitude: 28.298120498657227,
    },
    {
      id: 4,
      type: 1,
      timestamp: Date.now() - 86400000 * 0.5,
      description: '',
      latitude: -25.88470879377305,
      longitude: 28.298120498657227,
    },
  ];

  async addIncident(typeId, description, lon, lat) {
    await new Promise(resolve => setTimeout(resolve, 1000)); // simluate latency

    const lastId = this.incidents[this.incidents.length - 1].id;

    this.incidents.push({
      id: lastId + 1,
      type: typeId,
      timestamp: Date.now(),
      description,
      latitude: lat,
      longitude: lon,
    });
  }

  async getIncidents() {
    await new Promise(resolve => setTimeout(resolve, 1000)); // simulate latency
    return this.incidents;
  }

  async getIncidentTypes() {
    await new Promise(resolve => setTimeout(resolve, 1000)); // simulate latency
    return [
      {
        id: 1,
        name: 'Trap/snare',
      },
      {
        id: 2,
        name: 'Fence breach',
      },
      {
        id: 3,
        name: 'Poachers spotted',
      },
      {
        id: 4,
        name: 'Found animal',
      }
    ];
  }
}

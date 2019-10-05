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

export interface IncidentType {
  id: number;
  type: string;
}

@Injectable()
export class IncidentsService {
  constructor(
    private authService: AuthenticationService,
  ) {}

  async addIncident(typeId, description, lon, lat): Promise<boolean> {
    return await this.authService.post('addIncident', {
      lon,
      lat,
      pType: typeId,
      description,
    }) as boolean;
  }

  async getIncidents(): Promise<Incident[]> {
    const res = await this.authService.post('getIncidents', {});

    return (res as any[]).map(e => ({
      id: e.id,
      type: e.type,
      longitude: e.longitude,
      latitude: e.latitude,
      timestamp: e.timestamp,
      description: e.description,
    }));
  }

  async getIncidentTypes(): Promise<IncidentType[]> {
    const res = await this.authService.post('getPoachingIncidentTypes', {});
    return res as IncidentType[];
  }

  async addIncidentType(name: string): Promise<boolean> {
    return await this.authService.post('addPoachingIncidentType', {
      poachingType: name,
    }) as boolean;
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

  async addIncident(typeId, description, lon, lat): Promise<boolean> {
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

    return true;
  }

  async getIncidents(): Promise<Incident[]> {
    await new Promise(resolve => setTimeout(resolve, 1000)); // simulate latency
    return this.incidents;
  }

  async getIncidentTypes(): Promise<IncidentType[]> {
    await new Promise(resolve => setTimeout(resolve, 1000)); // simulate latency
    return [
      {
        id: 1,
        type: 'Trap/snare',
      },
      {
        id: 2,
        type: 'Fence breach',
      },
      {
        id: 3,
        type: 'Poachers spotted',
      },
      {
        id: 4,
        type: 'Found animal',
      }
    ];
  }
}

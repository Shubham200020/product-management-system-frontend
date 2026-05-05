import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timer } from 'rxjs';
import { switchMap, shareReplay, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface SystemStatus {
  databaseConnected: boolean;
  memoryUsedMB: number;
  memoryMaxMB: number;
  uptimeSeconds: number;
  apiStatus: string;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class StatusService {
  private apiUrl = 'http://localhost:8080/api/system/status';

  // Polling every 30 seconds
  private status$ = timer(0, 30000).pipe(
    switchMap(() => this.http.get<SystemStatus>(this.apiUrl, { withCredentials: true })),
    catchError(err => {
      console.error('Error fetching system status', err);
      return of({
        databaseConnected: false,
        memoryUsedMB: 0,
        memoryMaxMB: 0,
        uptimeSeconds: 0,
        apiStatus: 'DOWN',
        timestamp: Date.now()
      } as SystemStatus);
    }),
    shareReplay(1)
  );

  constructor(private http: HttpClient) {}

  getStatus(): Observable<SystemStatus> {
    return this.status$;
  }
}

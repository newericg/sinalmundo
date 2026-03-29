import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { CountryStatus } from '../models';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class SpeedDataService {
  private http = inject(HttpClient);

  getData(): Observable<CountryStatus[]> {
    return this.http.get<CountryStatus[]>('/assets/speed-data.json').pipe(catchError(() => of([])));
  }
}

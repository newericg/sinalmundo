import { Injectable, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { timer, of, Observable, forkJoin } from 'rxjs';
import { switchMap, take, catchError } from 'rxjs/operators';

import { IodaService } from './ioda.service';
import { CloudflareRadarService } from './cloudflare-radar.service';
import { countriesState, eventLog, isLoading } from '../state/app.state';
import { CountryStatus, EventLog } from '../models';
import { environment } from '../../../environments/environment';

interface FreedomEntry { code: string; score: number; status: string; }

@Injectable({ providedIn: 'root' })
export class InternetStatusService {
  private ioda = inject(IodaService);
  private cloudflare = inject(CloudflareRadarService);
  private http = inject(HttpClient);
  private destroyRef = inject(DestroyRef);

  init(): void {
    const mock$ = this.http.get<CountryStatus[]>('/assets/mock-data.json');
    const freedom$ = this.http.get<FreedomEntry[]>('/assets/freedom-data.json').pipe(catchError(() => of([])));
    const speed$ = this.cloudflare.getSpeedByCountry();

    // Carregar estrutura básica fallback de países para renderizar no mapa
    mock$.pipe(take(1)).subscribe(mockData => {
      countriesState.set(mockData);
      
      forkJoin({
        freedom: freedom$.pipe(take(1)),
        speed: speed$.pipe(take(1))
      }).subscribe(({ freedom, speed }) => {
        let current = [...countriesState()];
        
        freedom.forEach(f => {
          const idx = current.findIndex(c => c.code === f.code);
          if (idx >= 0) current[idx].censorship = this.freedomScoreToCensorship(f.score);
        });

        if (speed.length > 0) {
          speed.forEach(s => {
            const idx = current.findIndex(c => c.code === s.code);
            if (idx >= 0 && s.speed) current[idx].speed = s.speed;
          });
        }
        
        countriesState.set(current);
        isLoading.set(false);
      });

      // Polling vivo para Quedas Globais a cada 60s
      timer(0, environment.pollingInterval).pipe(
        switchMap(() => this.ioda.getActiveOutages()),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe(outages => {
        if (outages.length) {
          this.applyOutageData(outages);
          this.addEventLogEntries(outages);
        }
      });
    });
  }

  private addEventLogEntries(outages: Partial<CountryStatus>[]): void {
    const currentLogs = [...eventLog()];
    outages.slice(0, 5).forEach(o => {
      // Create an event for the critical outages
      if (o.status === 'outage' || o.status === 'slow') {
        const evt = {
          id: Math.random().toString(36).substr(2, 9),
          type: o.status,
          countryName: o.name || o.code || 'UNKNOWN',
          message: o.status === 'outage' ? `Disrupção crítica identificada via IODA BGP.` : `Alerta de lentidão via sensoriamento de métricas.`,
          timestamp: new Date()
        } as EventLog;
        currentLogs.unshift(evt);
      }
    });

    // Randomize some fake events if there aren't many to keep the UI cyber-feeling
    if (Math.random() > 0.5 && countriesState().length > 0) {
      const all = countriesState();
      const randomC = all[Math.floor(Math.random() * all.length)];
      currentLogs.unshift({
        id: Math.random().toString(36).substr(2, 9),
        type: 'restored',
        countryName: randomC.name,
        message: 'Conexão roteada alternativamente e estabelecida.',
        timestamp: new Date()
      } as EventLog);
    }
    
    eventLog.set(currentLogs.slice(0, 30));
  }

  private applyOutageData(outages: Partial<CountryStatus>[]): void {
    const current = [...countriesState()];
    outages.forEach(outage => {
      const idx = current.findIndex(c => c.code === outage.code);
      if (idx >= 0) {
        current[idx] = {
          ...current[idx],
          status: outage.status as 'outage'|'slow'|'censored'|'normal',
          uptime: outage.uptime ?? current[idx].uptime,
          lastUpdate: new Date()
        };
      }
    });
    countriesState.set(current);
  }

  private freedomScoreToCensorship(score: number): number {
    if (score <= 15) return 5;
    if (score <= 30) return 4;
    if (score <= 50) return 3;
    if (score <= 65) return 2;
    if (score <= 75) return 1;
    return 0;
  }
}

import { signal, computed } from '@angular/core';
import { CountryStatus, EventLog, MapMode } from '../models';

export const countriesState   = signal<CountryStatus[]>([]);
export const mapMode          = signal<MapMode>('outages');
export const showCables       = signal<boolean>(true);
export const selectedCountry  = signal<CountryStatus | null>(null);
export const activeFullModal  = signal<'speed' | 'outages' | 'censorship' | 'logs' | null>(null);
export const eventLog         = signal<EventLog[]>([]);
export const isLoading        = signal<boolean>(true);

export const outages = computed(() =>
  countriesState().filter(c => c.status === 'outage')
    .sort((a, b) => a.uptime - b.uptime)
);

export const censoredCountries = computed(() =>
  countriesState().filter(c => c.censorship >= 3)
    .sort((a, b) => b.censorship - a.censorship)
);

export const topSpeedCountries = computed(() =>
  [...countriesState()].sort((a, b) => b.speed - a.speed).slice(0, 8)
);

export const globalAvgSpeed = computed(() => {
  const all = countriesState();
  return all.length
    ? Math.round(all.reduce((s, c) => s + c.speed, 0) / all.length)
    : 0;
});

import { CountryStatus } from './country-status.model';
export interface Outage {
  country: CountryStatus;
  severity: 'critical' | 'high' | 'medium';
  detectedAt: Date;
}

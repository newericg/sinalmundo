export type EventType = 'outage' | 'slow' | 'restored' | 'censorship';
export interface EventLog {
  id: string;
  type: EventType;
  message: string;
  countryName: string;
  timestamp: Date;
}

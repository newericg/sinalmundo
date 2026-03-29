import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'uptime', standalone: true })
export class UptimePipe implements PipeTransform {
  transform(uptime: number): string {
    return `${uptime.toFixed(1)}%`;
  }
}

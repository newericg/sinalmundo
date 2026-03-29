import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'mbps', standalone: true })
export class MbpsPipe implements PipeTransform {
  transform(speed: number): string {
    if (speed < 1) return '< 1 Mbps';
    return `${Math.round(speed)} Mbps`;
  }
}

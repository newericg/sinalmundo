import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'timeAgo', standalone: true })
export class TimeAgoPipe implements PipeTransform {
  transform(value: Date | string | number): string {
    const time = new Date(value).getTime();
    const now = new Date().getTime();
    if (isNaN(time)) return '';

    const diffInSeconds = Math.floor((now - time) / 1000);
    
    if (diffInSeconds < 60) return `agora`;
    if (diffInSeconds < 3600) return `há ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `há ${Math.floor(diffInSeconds / 3600)} h`;
    return `há ${Math.floor(diffInSeconds / 86400)} dias`;
  }
}

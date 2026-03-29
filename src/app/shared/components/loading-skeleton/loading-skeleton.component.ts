import { Component } from '@angular/core';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  template: `<div class="skeleton"></div>`,
  styles: [`
    :host { display: block; width: 100%; height: 100%; }
    .skeleton {
      width: 100%; height: 100%;
      background: linear-gradient(90deg, var(--surface) 25%, var(--surface2) 50%, var(--surface) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: var(--radius);
    }
    @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  `]
})
export class LoadingSkeletonComponent {}

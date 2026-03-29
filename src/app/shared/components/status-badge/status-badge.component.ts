import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [ngClass]="['status-' + status()]">
      {{ status() | uppercase }}
    </span>
  `,
  styles: [`
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: var(--radius);
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .status-normal { background: rgba(0, 229, 160, 0.1); color: var(--green); border: 1px solid var(--green); }
    .status-slow { background: rgba(255, 140, 58, 0.1); color: var(--orange); border: 1px solid var(--orange); }
    .status-outage { background: rgba(255, 61, 90, 0.1); color: var(--red); border: 1px solid var(--red); }
    .status-censored { background: rgba(0, 200, 224, 0.1); color: var(--cyan); border: 1px solid var(--cyan); }
  `]
})
export class StatusBadgeComponent {
  status = input.required<'normal' | 'slow' | 'outage' | 'censored'>();
}

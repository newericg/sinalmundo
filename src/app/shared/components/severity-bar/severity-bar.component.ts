import { Component, input } from '@angular/core';

@Component({
  selector: 'app-severity-bar',
  standalone: true,
  template: `
    <div class="bar-container">
      @for (block of [1, 2, 3, 4, 5]; track block) {
        <div class="block" [class.active]="block <= score()" [class]="getColorClass()"></div>
      }
    </div>
  `,
  styles: [`
    .bar-container { display: flex; gap: 3px; }
    .block { width: 8px; height: 16px; background: rgba(255,255,255,0.05); border-radius: 2px; }
    .block.active.color-low { background: var(--yellow); }
    .block.active.color-mid { background: var(--orange); }
    .block.active.color-high { background: var(--red); }
  `]
})
export class SeverityBarComponent {
  score = input.required<number>();
  
  getColorClass(): string {
    const s = this.score();
    if (s <= 2) return 'color-low';
    if (s <= 4) return 'color-mid';
    return 'color-high';
  }
}

import { Component, input } from '@angular/core';

@Component({
  selector: 'app-pulse-dot',
  standalone: true,
  template: `
    <div class="pulse-wrapper">
      <div class="dot" [style.background-color]="color()"></div>
      <div class="pulse" [style.border-color]="color()"></div>
    </div>
  `,
  styles: [`
    .pulse-wrapper { position: relative; width: 8px; height: 8px; }
    .dot { width: 100%; height: 100%; border-radius: 50%; position: absolute; }
    .pulse {
      width: 100%; height: 100%; border-radius: 50%; border: 2px solid;
      position: absolute; top: -1px; left: -1px;
      animation: ripple 1.5s infinite ease-out;
    }
    @keyframes ripple {
      0% { transform: scale(1); opacity: 1; }
      100% { transform: scale(3); opacity: 0; }
    }
  `]
})
export class PulseDotComponent {
  color = input.required<string>();
}

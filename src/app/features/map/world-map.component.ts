import { Component, ElementRef, inject, output, Renderer2, signal, effect, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { CountryTooltipComponent } from './country-tooltip/country-tooltip.component';
import { countriesState, mapMode, showCables } from '../../core/state/app.state';
import { CountryStatus } from '../../core/models';

@Component({
  selector: 'app-world-map',
  standalone: true,
  imports: [CommonModule, CountryTooltipComponent],
  template: `
    <div class="relative w-full h-full opacity-60 flex items-center justify-center pointer-events-none overflow-hidden" #container>
      <svg class="w-full h-full drop-shadow-2xl pointer-events-auto transition-transform"
           style="will-change: transform; transition-duration: 50ms;"
           [ngClass]="{'cursor-grabbing': isDragging(), 'cursor-grab': !isDragging()}"
           [style.transform]="transformStyle()"
           (wheel)="onWheel($event)"
           (mousedown)="onMouseDown($event)"
           (window:mousemove)="onMouseMove($event)"
           (window:mouseup)="onMouseUp()"
           viewBox="0 0 1010 666" preserveAspectRatio="xMidYMid meet">
        @for (path of svgPaths(); track path.code) {
          <g class="country outline-none" 
             [id]="'country-' + path.code" 
             (mouseenter)="onEnter(path.code, $event)"
             (mousemove)="onMove($event)"
             (mouseleave)="onLeave()"
             (click)="selectCountry(path.code, $event)">
            <path [attr.d]="path.d" />
          </g>
        }
        
        <!-- Cables Layer -->
        @if (showCables()) {
          <g class="cables-layer pointer-events-none">
             @for (cable of cables; track cable.id) {
               <path [attr.d]="cable.d" fill="none" class="cable-path" />
             }
          </g>
        }
      </svg>
      <app-country-tooltip 
        [country]="hoveredCountry()"
        [x]="mouseX()" [y]="mouseY()" />
    </div>
  `,
  styles: [`
    ::ng-deep .cable-path {
      stroke: var(--secondary, #00c8e0);
      stroke-width: 1.5;
      stroke-linecap: round;
      opacity: 0.65;
      stroke-dasharray: 4 6;
      animation: pulseCable 5s linear infinite;
    }
    
    @keyframes pulseCable {
      to { stroke-dashoffset: -50; }
    }

    ::ng-deep .country-outage path { fill: var(--map-outage) !important; animation: pulseRed 2s infinite alternate; }
    ::ng-deep .country-slow path   { fill: var(--map-slow) !important; }
    ::ng-deep .country-censored path { fill: var(--map-censored) !important; }
    ::ng-deep .country-normal path { fill: var(--map-normal) !important; }
    
    ::ng-deep .country {
      path { fill: var(--map-fill); stroke: var(--map-stroke); stroke-width: 1; transition: 0.22s ease; }
      &:hover { filter: contrast(1.5) brightness(1.2); cursor: crosshair; path { stroke: var(--primary); stroke-width: 2; z-index: 10; } }
    }
    
    @keyframes pulseRed {
      0% { fill: var(--map-outage); }
      100% { fill: var(--error); }
    }
  `]
})
export class WorldMapComponent {
  private http = inject(HttpClient);
  private renderer = inject(Renderer2);
  private el = inject(ElementRef);
  
  svgPaths = signal<any[]>([]);
  hoveredCountry = signal<CountryStatus | null>(null);
  mouseX = signal(0);
  mouseY = signal(0);
  
  countrySelected = output<string>();

  isDragging = signal(false);
  hasDragged = signal(false);
  mapScale = signal(1);
  panX = signal(0);
  panY = signal(0);
  lastMouseX = signal(0);
  lastMouseY = signal(0);
  
  showCables = showCables;
  cables = [
    { id: 'tat-14', d: 'M 280 200 Q 380 160 490 170' }, 
    { id: 'cross-atlantic', d: 'M 280 220 Q 350 280 430 350' }, 
    { id: 'monet', d: 'M 280 220 Q 300 300 340 380' }, 
    { id: 'sam-1', d: 'M 340 380 Q 300 450 280 500' }, 
    { id: 'pacific-east', d: 'M 150 220 Q 70 200 -10 250' }, 
    { id: 'pacific-west', d: 'M 1010 250 Q 950 220 860 210' }, 
    { id: 'sea-me-we-3', d: 'M 490 170 Q 550 260 620 280 T 700 320 T 780 400' }, 
    { id: 'apcn-2', d: 'M 860 210 Q 810 300 780 400' }, 
    { id: 'palapa', d: 'M 780 400 Q 800 450 880 500' }, 
    { id: 'atlantis-2', d: 'M 340 380 Q 380 340 430 350' }, 
    { id: 'sacs', d: 'M 340 380 Q 440 460 540 500' }, 
    { id: 'safe', d: 'M 540 500 Q 620 420 700 320' }, 
    { id: 'pan-am', d: 'M 280 500 Q 180 400 150 220' }, 
    { id: 'ace', d: 'M 430 350 Q 450 250 490 170' } 
  ];

  transformStyle = computed(() => `translate(${this.panX()}px, ${this.panY()}px) scale(${this.mapScale()})`);

  constructor() {
    this.http.get<any[]>('/assets/world-paths.json').subscribe(data => this.svgPaths.set(data));
    
    effect(() => {
      const mode = mapMode();
      const countries = countriesState();
      
      countries.forEach(c => {
        const svgGroup = document.getElementById(`country-${c.code}`);
        if (svgGroup) {
           this.renderer.removeClass(svgGroup, 'country-outage');
           this.renderer.removeClass(svgGroup, 'country-slow');
           this.renderer.removeClass(svgGroup, 'country-censored');
           this.renderer.removeClass(svgGroup, 'country-normal');
          
           let targetClass = 'country-normal';
           if (mode === 'outages') {
             if (c.status === 'outage') targetClass = 'country-outage';
             else if (c.status === 'slow') targetClass = 'country-slow';
             else if (c.status === 'censored') targetClass = 'country-censored';
           } else if (mode === 'censorship') {
             if (c.censorship >= 4) targetClass = 'country-censored';
             else if (c.censorship >= 2) targetClass = 'country-slow';
           } else if (mode === 'speed') {
             if (c.speed < 50) targetClass = 'country-slow';
             else if (c.speed > 180) targetClass = 'country-normal';
           }
          
           this.renderer.addClass(svgGroup, targetClass);
        }
      });
    });
  }

  onWheel(e: WheelEvent) {
    if (this.hoveredCountry()) e.preventDefault();
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    const newScale = Math.min(Math.max(1, this.mapScale() + delta), 6);
    this.mapScale.set(newScale);
  }

  onMouseDown(e: MouseEvent) {
    // Only drag with left button
    if (e.button !== 0) return;
    this.isDragging.set(true);
    this.hasDragged.set(false);
    this.lastMouseX.set(e.clientX);
    this.lastMouseY.set(e.clientY);
  }

  onMouseMove(e: MouseEvent) {
    if (!this.isDragging()) return;
    
    const dx = e.clientX - this.lastMouseX();
    const dy = e.clientY - this.lastMouseY();
    
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      this.hasDragged.set(true);
    }
    
    this.panX.update(x => x + dx);
    this.panY.update(y => y + dy);
    
    this.lastMouseX.set(e.clientX);
    this.lastMouseY.set(e.clientY);
  }

  onMouseUp() {
    this.isDragging.set(false);
  }

  onEnter(code: string, event: MouseEvent) {
    const country = countriesState().find(c => c.code === code) || null;
    this.hoveredCountry.set(country);
    this.updateMousePos(event);
  }

  onMove(event: MouseEvent) {
    this.updateMousePos(event);
  }

  onLeave() {
    this.hoveredCountry.set(null);
  }

  selectCountry(code: string, event: MouseEvent) {
    if (this.hasDragged()) return;
    this.countrySelected.emit(code);
  }

  private updateMousePos(e: MouseEvent) {
    const container = this.el.nativeElement.querySelector('div');
    if (!container) return;
    const rect = container.getBoundingClientRect();
    this.mouseX.set(e.clientX - rect.left);
    this.mouseY.set(e.clientY - rect.top);
  }
}

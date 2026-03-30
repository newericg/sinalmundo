import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { TickerComponent } from '../ticker/ticker.component';
import { WorldMapComponent } from '../map/world-map.component';
import { StatsPanelComponent } from '../panels/stats-panel/stats-panel.component';
import { OutageListComponent } from '../panels/outage-list/outage-list.component';
import { CensorshipListComponent } from '../panels/censorship-list/censorship-list.component';
import { SpeedRankingComponent } from '../panels/speed-ranking/speed-ranking.component';
import { SparklineChartComponent } from '../panels/sparkline-chart/sparkline-chart.component';
import { EventLogComponent } from '../panels/event-log/event-log.component';
import { CountryDetailModalComponent } from '../panels/country-detail-modal/country-detail-modal.component';
import { FullListModalComponent } from '../panels/full-list-modal/full-list-modal.component';
import { InternetStatusService } from '../../core/services/internet-status.service';
import { mapMode, isLoading, showCables, eventLog, countriesState, activeFullModal } from '../../core/state/app.state';
import { MapMode } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, DatePipe,
    TickerComponent, WorldMapComponent, StatsPanelComponent,
    OutageListComponent, CensorshipListComponent, SpeedRankingComponent,
    SparklineChartComponent, EventLogComponent, CountryDetailModalComponent, FullListModalComponent
  ],
  template: `
    <!-- TopNavBar -->
    <header class="glass-header h-16 fixed top-0 w-full z-50 flex justify-between items-center px-6 border-b border-primary/10 transition-all">
      <div class="flex items-center gap-4">
        <span class="text-2xl font-black font-headline tracking-tighter flex items-center gap-2">
          <span class="text-primary drop-shadow-[0_0_8px_rgba(47,243,173,0.4)]">⚡ Sinal</span><span class="text-secondary/80">Mundo</span>
        </span>
        <div class="hidden lg:flex gap-8 ml-12 font-headline uppercase tracking-widest text-[10px] cursor-pointer">
          <a (click)="activeTab.set('GLOBAL')" [ngClass]="{'text-primary border-b-2 border-primary pb-1': activeTab() === 'GLOBAL', 'text-outline hover:text-secondary transition-colors': activeTab() !== 'GLOBAL'}">GLOBAL</a>
          <a (click)="activeTab.set('REGIONS')" [ngClass]="{'text-primary border-b-2 border-primary pb-1': activeTab() === 'REGIONS', 'text-outline hover:text-secondary transition-colors': activeTab() !== 'REGIONS'}">REGIONS</a>
          <a (click)="activeTab.set('NETWORK')" [ngClass]="{'text-primary border-b-2 border-primary pb-1': activeTab() === 'NETWORK', 'text-outline hover:text-secondary transition-colors': activeTab() !== 'NETWORK'}">NETWORK</a>
          <a (click)="activeTab.set('SATELLITE')" [ngClass]="{'text-primary border-b-2 border-primary pb-1': activeTab() === 'SATELLITE', 'text-outline hover:text-secondary transition-colors': activeTab() !== 'SATELLITE'}">SATELLITE</a>
        </div>
      </div>
      <div class="flex items-center gap-6">
        <div class="flex items-center gap-2 px-3 py-1 bg-error-container/20 border border-error/20">
          <span class="w-2 h-2 rounded-full bg-error pulse-red"></span>
          <span class="font-mono text-[10px] text-error font-bold uppercase tracking-wider">● AO VIVO</span>
        </div>
        <div class="font-mono text-secondary text-sm tabular-nums tracking-widest">
          {{ systemTime | date:'HH:mm:ss' }} <span class="text-outline ml-1">UTC</span>
        </div>
        <div class="flex gap-4 text-outline select-none">
          <!-- Toggle Theme -->
          <span (click)="toggleTheme()" class="material-symbols-outlined cursor-pointer hover:text-primary transition-all" title="Alternar Arctic Mode">light_mode</span>
          <!-- Global Search -->
          <span (click)="showSearch.set(true)" class="material-symbols-outlined cursor-pointer hover:text-primary transition-all" title="Busca Global (Ctrl+K)">search</span>
          <!-- Toggle Panels -->
          <span (click)="showPanels.set(!showPanels())" class="material-symbols-outlined cursor-pointer hover:text-primary transition-all" [ngClass]="{'text-primary': !showPanels()}" title="Modo Cinemático">settings_input_antenna</span>
          <!-- Sound Alarm -->
          <span (click)="toggleSound()" class="material-symbols-outlined cursor-pointer hover:text-primary transition-all" [ngClass]="{'text-primary': soundEnabled()}" title="Alertas Sonoros">
            {{ soundEnabled() ? 'notifications_active' : 'notifications_off' }}
          </span>
          <span class="material-symbols-outlined cursor-pointer hover:text-primary transition-all" title="Perfil">account_circle</span>
        </div>
      </div>
    </header>

    @if (showSearch()) {
      <div class="fixed inset-0 z-[100] bg-background/80 backdrop-blur-md flex items-start justify-center pt-32" (click)="showSearch.set(false)">
        <div class="w-[500px] bg-surface-container border border-primary/20 shadow-2xl p-2 rounded-lg flex items-center" (click)="$event.stopPropagation()">
           <span class="material-symbols-outlined text-outline px-2">search</span>
           <input type="text" #searchInput (keyup.enter)="executeSearch(searchInput.value)" placeholder="Localizar país (ex: BR, Japão)..." class="flex-1 bg-transparent border-none text-white focus:ring-0 text-xl font-headline outline-none" autofocus>
        </div>
      </div>
    }

    <main class="flex-1 mt-16 flex overflow-hidden w-full relative">
      <!-- Left Panel (280px) -->
      @if (showPanels()) {
      <aside class="w-[280px] bg-surface-dim border-r border-primary/5 flex flex-col overflow-hidden shrink-0 transition-all duration-300">
        <app-stats-panel></app-stats-panel>
        <div class="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
          <app-outage-list (countrySelected)="focusMap($event)"></app-outage-list>
          <app-censorship-list></app-censorship-list>
        </div>
      </aside>
      }

      <!-- Center Map (flex) -->
      <section class="flex-1 relative transition-all duration-300 flex flex-col min-w-0" [ngClass]="{'bg-surface-container-lowest': activeTab() === 'SATELLITE', 'map-bg-class': activeTab() !== 'SATELLITE'}">
        <!-- Map Controls -->
        <div class="absolute top-6 left-6 z-20 flex gap-1 p-1 bg-surface-container-lowest/80 border border-white/5 backdrop-blur-md">
          <button (click)="setMode('outages')" [ngClass]="{'bg-primary text-on-primary-container font-bold': currentMode() === 'outages', 'text-outline hover:text-white transition-all': currentMode() !== 'outages'}" class="px-3 py-1.5 font-mono text-[10px]">QUEDAS</button>
          <button (click)="setMode('speed')" [ngClass]="{'bg-primary text-on-primary-container font-bold': currentMode() === 'speed', 'text-outline hover:text-white transition-all': currentMode() !== 'speed'}" class="px-3 py-1.5 font-mono text-[10px]">VELOCIDADE</button>
          <button (click)="setMode('censorship')" [ngClass]="{'bg-primary text-on-primary-container font-bold': currentMode() === 'censorship', 'text-outline hover:text-white transition-all': currentMode() !== 'censorship'}" class="px-3 py-1.5 font-mono text-[10px]">CENSURA</button>
          
          <div class="w-px bg-white/10 mx-1"></div>
          
          <button (click)="toggleCables()" [ngClass]="{'bg-[#00c8e0] text-[#040c10] font-bold shadow-[0_0_10px_rgba(0,200,224,0.5)]': showCables(), 'text-outline hover:text-white transition-all': !showCables()}" class="px-3 py-1.5 font-mono text-[10px] flex items-center gap-1">
            <span class="material-symbols-outlined text-[12px] leading-none tracking-tighter">cable</span> CABOS
          </button>
        </div>

        <div class="flex-1 relative overflow-hidden flex items-center justify-center p-8">
           <!-- Grid Overlay -->
           <div class="absolute inset-0 z-0 opacity-[0.04]" style="background-image: linear-gradient(#00e5a0 1px, transparent 1px), linear-gradient(90deg, #00e5a0 1px, transparent 1px); background-size: 40px 40px;"></div>
           
           <div class="relative w-full h-full z-10 flex items-center justify-center pointer-events-none child-auto-pointer">
             <app-world-map (countrySelected)="focusMap($event)" class="w-full h-full block pointer-events-auto"></app-world-map>
           </div>
        </div>

        <!-- Legend -->
        <div class="absolute bottom-6 left-6 z-20 flex gap-6 text-[9px] font-mono tracking-widest text-outline">
          <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-[#2a0a0f] border border-error/50"></span> QUEDA TOTAL</div>
          <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-[#1f1505] border border-tertiary/50"></span> LENTIDÃO</div>
          <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-[#0d0d1f] border border-secondary/50"></span> CENSURADO</div>
          <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-[#061a12] border border-primary/50"></span> NORMAL</div>
        </div>
      </section>

      <!-- Right Panel (300px) -->
      @if (showPanels()) {
      <aside class="w-[300px] bg-surface-dim border-l border-primary/5 flex flex-col overflow-hidden shrink-0 transition-all duration-300">
        <div class="p-4 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
          <app-sparkline-chart></app-sparkline-chart>
          <app-speed-ranking></app-speed-ranking>
          <app-event-log></app-event-log>
        </div>
        <!-- SideNav Footer -->
        <div class="p-4 border-t border-white/5 grid grid-cols-2 gap-2">
          <a href="https://github.com/gatech-ioda" target="_blank" class="flex items-center justify-center gap-2 p-2 bg-surface-container-high hover:bg-surface-bright transition-all text-outline hover:text-white cursor-pointer decoration-transparent">
            <span class="material-symbols-outlined text-sm">help_center</span>
            <span class="font-mono text-[10px]">IODA BASE</span>
          </a>
          <a href="https://radar.cloudflare.com/" target="_blank" class="flex items-center justify-center gap-2 p-2 bg-surface-container-high hover:bg-surface-bright transition-all text-outline hover:text-white cursor-pointer decoration-transparent">
            <span class="material-symbols-outlined text-sm">description</span>
            <span class="font-mono text-[10px]">RADAR API</span>
          </a>
        </div>
      </aside>
      }

      <!-- Modal Injection Layer -->
      @if (selectedModalCountry()) {
        <app-country-detail-modal [countryCode]="selectedModalCountry()!" (close)="selectedModalCountry.set(null)" />
      }
      @if (activeFullModal()) {
        <app-full-list-modal />
      }
    </main>
    <app-ticker></app-ticker>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; height: 100%; width: 100%; }
    .child-auto-pointer * { pointer-events: auto; }
  `]
})
export class DashboardComponent implements OnInit {
  private statusService = inject(InternetStatusService);

  currentMode = mapMode;
  showCables = showCables;
  isLoading = isLoading;
  systemTime = new Date();
  
  activeTab = signal<string>('GLOBAL');
  showPanels = signal<boolean>(true);
  soundEnabled = signal<boolean>(false);
  showSearch = signal<boolean>(false);
  
  activeFullModal = activeFullModal;
  selectedModalCountry = signal<string | null>(null);

  constructor() {
    effect(() => {
      const logs = eventLog();
      // If a new event is added
      if (this.soundEnabled() && logs.length > 0) {
        this.playBeep();
        if (Notification.permission === 'granted') {
          try {
            const latest = logs[0];
            new Notification(`SinalMundo: ${latest.type.toUpperCase()}`, { body: latest.message });
          } catch(e) {}
        }
      }
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
         e.preventDefault();
         this.showSearch.set(true);
      }
      if (e.key === 'Escape') this.showSearch.set(false);
    });
  }

  toggleTheme() {
    document.documentElement.classList.toggle('dark');
  }

  executeSearch(query: string) {
    if (!query) return;
    const term = query.toLowerCase();
    const c = countriesState().find(c => c.name.toLowerCase().includes(term) || c.code.toLowerCase() === term);
    
    if (c) {
       this.showSearch.set(false);
       this.focusMap(c.code);
    }
  }

  ngOnInit() {
    this.statusService.init();
    setInterval(() => this.systemTime = new Date(), 1000);
  }

  toggleSound() {
    this.soundEnabled.set(!this.soundEnabled());
    if (this.soundEnabled()) {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
      this.playBeep();
    }
  }

  private playBeep() {
    try {
      const ctx = new window.AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch(e) {}
  }

  setMode(mode: MapMode) {
    mapMode.set(mode);
  }

  toggleCables() {
    showCables.set(!showCables());
  }

  focusMap(countryCode: string) {
    const svgGroup = document.getElementById(`country-${countryCode}`);
    if (svgGroup) {
      svgGroup.style.transition = '0.3s';
      svgGroup.style.filter = 'brightness(3)';
      setTimeout(() => svgGroup.style.filter = '', 1000);
    }
    this.selectedModalCountry.set(countryCode);
  }
}

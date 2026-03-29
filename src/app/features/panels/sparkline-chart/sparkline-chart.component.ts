import { Component, ElementRef, viewChild, afterNextRender } from '@angular/core';

@Component({
  selector: 'app-sparkline-chart',
  standalone: true,
  template: `
    <div>
      <div class="flex justify-between items-center mb-3">
        <h4 class="font-mono text-[10px] text-outline tracking-widest uppercase">INSTABILIDADE — 24H</h4>
        <span class="bg-error/10 text-error text-[10px] px-1 font-mono">+12% ▲</span>
      </div>
      <div class="h-20 w-full bg-surface-container-low relative border border-white/5 overflow-hidden">
        <canvas #canvas class="absolute inset-0 w-full h-full"></canvas>
      </div>
    </div>
  `
})
export class SparklineChartComponent {
  canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');

  constructor() {
    afterNextRender(() => {
      this.drawChart();
    });
  }

  drawChart() {
    const el = this.canvas()?.nativeElement;
    if (!el) return;
    const parent = el.parentElement;
    if (parent) {
      el.width = parent.clientWidth;
      el.height = parent.clientHeight;
    }
    
    const ctx = el.getContext('2d');
    if (!ctx) return;
    
    const w = el.width;
    const h = el.height;
    
    const points = Array.from({length: 24}, () => Math.random() * h * 0.8 + h * 0.1);
    
    ctx.clearRect(0, 0, w, h);
    ctx.beginPath();
    ctx.moveTo(0, h);
    
    points.forEach((px, i) => {
      const x = (i / (points.length - 1)) * w;
      ctx.lineTo(x, h - px);
    });
    
    ctx.lineTo(w, h);
    ctx.closePath();
    
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(255, 111, 122, 0.4)'); // tertiary mapped
    grad.addColorStop(1, 'rgba(255, 111, 122, 0)');
    
    ctx.fillStyle = grad;
    ctx.fill();
    
    ctx.beginPath();
    points.forEach((px, i) => {
      const x = (i / (points.length - 1)) * w;
      if (i === 0) ctx.moveTo(x, h - px);
      else ctx.lineTo(x, h - px);
    });
    
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ff6f7a'; 
    ctx.stroke();
  }
}

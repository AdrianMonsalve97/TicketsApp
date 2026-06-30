import { Component, OnInit } from '@angular/core';

interface LightOrb {
  color: string;
  top: string;
  left: string;
  size: string;
  duration: string;
  delay: string;
}

@Component({
  selector: 'app-background-geometry',
  standalone: true,
  templateUrl: './background-geometry.html',
  styleUrl: './background-geometry.css',
})
export class BackgroundGeometryComponent implements OnInit {
  orbs: LightOrb[] = [];

  ngOnInit() {
    const paletaColores = [
      'bg-pink-600/40',
      'bg-violet-600/40',
      'bg-blue-600/30',
      'bg-fuchsia-500/30',
    ];

    this.orbs = paletaColores.map((color) => ({
      color: color,
      top: `${Math.floor(Math.random() * 90) - 10}%`,
      left: `${Math.floor(Math.random() * 90) - 10}%`,
      size: `${Math.floor(Math.random() * 300) + 400}px`,
      duration: `${Math.floor(Math.random() * 10) + 15}s`,
      delay: `${Math.floor(Math.random() * 5)}s`,
    }));
  }
}

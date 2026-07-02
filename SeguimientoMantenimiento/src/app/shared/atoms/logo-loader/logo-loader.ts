import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logo-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logo-loader.html',
  styleUrl: './logo-loader.css',
})
export class LogoLoaderComponent {
  size = input<'sm' | 'md' | 'lg'>('md');

  public get sizeClass(): string {
    switch (this.size()) {
      case 'sm':
        return 'w-10 h-10';
      case 'lg':
        return 'w-20 h-20';
      default:
        return 'w-14 h-14';
    }
  }
}

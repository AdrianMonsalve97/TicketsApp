// Archivo: src/app/shared/molecules/modal/modal.ts
import {
  Component,
  OnDestroy,
  effect,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  imports: [CommonModule],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class Modal implements OnDestroy {
  visible = input(false);
  title = input('');
  maxWidth = input('');
  size = input<'sm' | 'md' | 'lg' | 'xl' | 'full'>('md');

  close = output<void>();
  visibleChange = output<boolean>();

  constructor() {
    effect(() => {
      if (this.visible()) {
        document.body.classList.add('modal-hud-active');
      } else {
        document.body.classList.remove('modal-hud-active');
      }
    });
  }

  ngOnDestroy(): void {
    document.body.classList.remove('modal-hud-active');
  }

  public get sizeClass(): string {
    const maxWidth = this.maxWidth();
    if (maxWidth && maxWidth.trim() !== '') return maxWidth;
    switch (this.size()) {
      case 'sm':
        return 'max-w-sm';
      case 'md':
        return 'max-w-xl';
      case 'lg':
        return 'max-w-3xl';
      case 'xl':
        return 'max-w-5xl';
      case 'full':
        return 'max-w-full h-screen rounded-none border-none m-0';
      default:
        return 'max-w-xl';
    }
  }

  cerrarModal(): void {
    this.visibleChange.emit(false);
    this.close.emit();
  }
}

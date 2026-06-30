// Archivo: src/app/shared/molecules/modal/modal.ts
import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
  OnDestroy,
} from '@angular/core';
import { NgClass, CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [NgClass, CommonModule],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class Modal implements OnChanges, OnDestroy {
  @Input() visible = false;
  @Input() title = '';
  @Input() maxWidth = '';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md';

  @Output() close = new EventEmitter<void>();
  @Output() visibleChange = new EventEmitter<boolean>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']) {
      if (this.visible) {
        document.body.classList.add('modal-hud-active');
      } else if (!changes['visible'].firstChange) {
        document.body.classList.remove('modal-hud-active');
      }
    }
  }

  ngOnDestroy(): void {
    document.body.classList.remove('modal-hud-active');
  }

  public get sizeClass(): string {
    if (this.maxWidth && this.maxWidth.trim() !== '') return this.maxWidth;
    switch (this.size) {
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
    this.visible = false;
    this.visibleChange.emit(false);
    this.close.emit();
  }
}

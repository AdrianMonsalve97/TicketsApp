import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ToastMessage, ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-host',
  imports: [CommonModule],
  templateUrl: './toast-host.html',
  styleUrl: './toast-host.css',
})
export class ToastHostComponent {
  private readonly toastService = inject(ToastService);

  public readonly messages = this.toastService.messages;

  dismiss(message: ToastMessage): void {
    this.toastService.dismiss(message.id);
  }

  runAction(message: ToastMessage): void {
    message.action?.();
  }

  toneClass(message: ToastMessage): string {
    const tones: Record<ToastMessage['tone'], string> = {
      loading: 'border-blue-400/40 bg-blue-500/10 text-blue-100',
      success: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100',
      warning: 'border-amber-400/40 bg-amber-500/10 text-amber-100',
      error: 'border-rose-400/40 bg-rose-500/10 text-rose-100',
      info: 'border-sky-400/40 bg-sky-500/10 text-sky-100',
    };

    return tones[message.tone];
  }
}

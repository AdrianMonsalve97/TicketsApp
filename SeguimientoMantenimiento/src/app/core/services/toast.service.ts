import { Injectable, signal } from '@angular/core';

export type ToastTone = 'loading' | 'success' | 'warning' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  title: string;
  detail?: string;
  tone: ToastTone;
  persistent: boolean;
  actionLabel?: string;
  action?: () => void;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly messagesSignal = signal<ToastMessage[]>([]);

  public readonly messages = this.messagesSignal.asReadonly();

  loading(id: string, title: string, detail?: string): void {
    this.upsert({
      id,
      title,
      detail,
      tone: 'loading',
      persistent: true,
    });
  }

  success(id: string, title: string, detail?: string): void {
    this.upsert({
      id,
      title,
      detail,
      tone: 'success',
      persistent: false,
    });
    window.setTimeout(() => this.dismiss(id), 3200);
  }

  warning(id: string, title: string, detail?: string): void {
    this.upsert({
      id,
      title,
      detail,
      tone: 'warning',
      persistent: false,
    });
    window.setTimeout(() => this.dismiss(id), 4800);
  }

  error(
    id: string,
    title: string,
    detail?: string,
    actionLabel?: string,
    action?: () => void,
  ): void {
    this.upsert({
      id,
      title,
      detail,
      tone: 'error',
      persistent: true,
      actionLabel,
      action,
    });
  }

  dismiss(id: string): void {
    this.messagesSignal.update((messages) => messages.filter((message) => message.id !== id));
  }

  clear(): void {
    this.messagesSignal.set([]);
  }

  private upsert(message: ToastMessage): void {
    this.messagesSignal.update((messages) => {
      const index = messages.findIndex((item) => item.id === message.id);
      if (index === -1) {
        return [...messages, message];
      }

      const updated = [...messages];
      updated[index] = message;
      return updated;
    });
  }
}

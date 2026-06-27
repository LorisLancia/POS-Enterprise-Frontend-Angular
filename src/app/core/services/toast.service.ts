import { Injectable, signal } from '@angular/core';
import { Toast } from '../models/toast.model';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  readonly toasts = signal<Toast[]>([]);

  private add(message: string, type: Toast['type'], title?: string) {
    const id = ++this.counter;
    const toast: Toast = { id, message, type, title };
    this.toasts.update((list) => [...list, toast]);

    // Auto-remove dopo 3s (success/info) o 5s (error/warning)
    const delay = type === 'error' || type === 'warning' ? 5000 : 3000;
    setTimeout(() => this.remove(id), delay);
  }

  success(message: string, title = 'Successo') {
    this.add(message, 'success', title);
  }

  error(message: string, title = 'Errore') {
    this.add(message, 'error', title);
  }

  warning(message: string, title = 'Attenzione') {
    this.add(message, 'warning', title);
  }

  info(message: string, title = 'Info') {
    this.add(message, 'info', title);
  }

  remove(id: number) {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }
}

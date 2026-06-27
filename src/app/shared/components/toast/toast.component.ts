import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast toast-{{ toast.type }}">
          @if (toast.title) {
            <strong>{{ toast.title }}</strong>
          }
          <span>{{ toast.message }}</span>
          <button class="toast-close" (click)="toastService.remove(toast.id)">×</button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .toast-container {
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        max-width: 320px;
      }
      .toast {
        padding: 0.75rem 1rem;
        border-radius: 8px;
        color: #fff;
        font-size: 0.875rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 0.5rem;
        animation: slideIn 0.3s ease;
        position: relative;
        padding-right: 2rem;
      }
      .toast-success {
        background: #10b981;
      }
      .toast-error {
        background: #ef4444;
      }
      .toast-warning {
        background: #f59e0b;
      }
      .toast-info {
        background: #3b82f6;
      }
      .toast strong {
        display: block;
        font-weight: 600;
        margin-bottom: 0.125rem;
      }
      .toast-close {
        position: absolute;
        top: 0.25rem;
        right: 0.5rem;
        background: none;
        border: none;
        color: #fff;
        font-size: 1.25rem;
        cursor: pointer;
        opacity: 0.8;
      }
      .toast-close:hover {
        opacity: 1;
      }
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `,
  ],
})
export class ToastComponent {
  toastService = inject(ToastService);
}

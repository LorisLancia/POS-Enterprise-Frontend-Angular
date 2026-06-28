import { Injectable, signal } from '@angular/core';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  dialogData = signal<ConfirmDialogData | null>(null);

  open(data: ConfirmDialogData) {
    this.dialogData.set(data);
  }

  close() {
    this.dialogData.set(null);
  }

  confirm() {
    const data = this.dialogData();
    if (data) {
      data.onConfirm();
      this.close();
    }
  }
}

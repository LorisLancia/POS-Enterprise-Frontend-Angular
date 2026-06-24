import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UnitConversionsService } from '../../core/services/unit-conversions.service';
import { UnitsService } from '../../core/services/units.service';
import { UnitConversion } from '../../core/models/unit-conversion.model';
import { Unit } from '../../core/models/unit.model';

@Component({
  selector: 'app-unit-conversions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './unit-conversions.component.html',
  styleUrl: './unit-conversions.component.scss',
})
export class UnitConversionsComponent implements OnInit {
  conversions = signal<UnitConversion[]>([]);
  units = signal<Unit[]>([]);
  loading = signal(false);
  error = signal('');
  showForm = signal(false);
  editingConversion = signal<UnitConversion | null>(null);

  formFromUnitId = signal(0);
  formToUnitId = signal(0);
  formFactor = signal(1);

  hasConversions = computed(() => this.conversions().length > 0);
  isEditing = computed(() => this.editingConversion() !== null);

  constructor(
    private conversionsService: UnitConversionsService,
    private unitsService: UnitsService,
  ) {}

  ngOnInit(): void {
    this.loadConversions();
    this.loadUnits();
  }

  loadConversions(): void {
    this.loading.set(true);
    this.error.set('');
    this.conversionsService.getAll().subscribe({
      next: (data) => {
        this.conversions.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error: ' + (err.message || 'Unknown'));
        this.loading.set(false);
      },
    });
  }

  loadUnits(): void {
    this.unitsService.getAll().subscribe({
      next: (data: Unit[]) => this.units.set(data),
      error: () => {},
    });
  }

  openCreateForm(): void {
    this.editingConversion.set(null);
    this.formFromUnitId.set(0);
    this.formToUnitId.set(0);
    this.formFactor.set(1);
    this.showForm.set(true);
  }

  openEditForm(conv: UnitConversion): void {
    this.editingConversion.set(conv);
    this.formFromUnitId.set(conv.fromUnitId);
    this.formToUnitId.set(conv.toUnitId);
    this.formFactor.set(conv.factor);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingConversion.set(null);
  }

  saveConversion(): void {
    if (
      !this.formFromUnitId() ||
      !this.formToUnitId() ||
      this.formFromUnitId() === this.formToUnitId()
    ) {
      this.error.set('Select two different units');
      return;
    }
    if (!this.formFactor() || this.formFactor() <= 0) {
      this.error.set('Factor must be greater than 0');
      return;
    }

    this.loading.set(true);
    const dto = {
      fromUnitId: Number(this.formFromUnitId()),
      toUnitId: Number(this.formToUnitId()),
      factor: Number(this.formFactor()),
    };

    const op =
      this.isEditing() && this.editingConversion()
        ? this.conversionsService.update(this.editingConversion()!.id, dto)
        : this.conversionsService.create(dto);

    op.subscribe({
      next: () => {
        this.loading.set(false);
        this.loadConversions();
        this.closeForm();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Error: ' + (err.message || 'Unknown'));
      },
    });
  }

  deleteConversion(id: number): void {
    if (!confirm('Delete this conversion?')) return;
    this.loading.set(true);
    this.conversionsService.delete(id).subscribe({
      next: () => {
        this.loading.set(false);
        this.loadConversions();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Error: ' + err.message);
      },
    });
  }

  getUnitName(unitId: number): string {
    return this.units().find((u) => u.id === unitId)?.symbol || '-';
  }
}

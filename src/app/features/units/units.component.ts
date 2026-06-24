import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UnitsService } from '../../core/services/units.service';
import { Unit } from '../../core/models/unit.model';

@Component({
  selector: 'app-units',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './units.component.html',
  styleUrl: './units.component.scss',
})
export class UnitsComponent implements OnInit {
  units = signal<Unit[]>([]);
  loading = signal(false);
  error = signal('');
  showForm = signal(false);
  editingUnit = signal<Unit | null>(null);

  formName = signal('');
  formSymbol = signal('');
  formType = signal('piece');

  hasUnits = computed(() => this.units().length > 0);
  isEditing = computed(() => this.editingUnit() !== null);

  constructor(private unitsService: UnitsService) {}

  ngOnInit(): void {
    this.loadUnits();
  }

  loadUnits(): void {
    this.loading.set(true);
    this.error.set('');
    this.unitsService.getAll().subscribe({
      next: (data) => {
        this.units.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error: ' + (err.message || 'Unknown'));
        this.loading.set(false);
      },
    });
  }

  openCreateForm(): void {
    this.editingUnit.set(null);
    this.formName.set('');
    this.formSymbol.set('');
    this.formType.set('piece');
    this.showForm.set(true);
  }

  openEditForm(u: Unit): void {
    this.editingUnit.set(u);
    this.formName.set(u.name);
    this.formSymbol.set(u.symbol);
    this.formType.set(u.type);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingUnit.set(null);
  }

  saveUnit(): void {
    if (!this.formName() || !this.formSymbol()) {
      this.error.set('Name and symbol are required');
      return;
    }

    this.loading.set(true);
    const dto = {
      name: this.formName(),
      symbol: this.formSymbol(),
      type: this.formType(),
    };

    const op =
      this.isEditing() && this.editingUnit()
        ? this.unitsService.update(this.editingUnit()!.id, dto)
        : this.unitsService.create(dto);

    op.subscribe({
      next: () => {
        this.loading.set(false);
        this.loadUnits();
        this.closeForm();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Error: ' + (err.message || 'Unknown'));
      },
    });
  }

  deleteUnit(id: number): void {
    if (!confirm('Delete this unit?')) return;
    this.loading.set(true);
    this.unitsService.delete(id).subscribe({
      next: () => {
        this.loading.set(false);
        this.loadUnits();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Error: ' + err.message);
      },
    });
  }
}

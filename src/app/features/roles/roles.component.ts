import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RolesService } from '../../core/services/roles.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Role, PermissionGroup } from '../../core/models/role.model';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss'],
})
export class RolesComponent implements OnInit {
  private rolesService = inject(RolesService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  roles = signal<Role[]>([]);
  permissionGroups = signal<PermissionGroup[]>([]);
  loading = signal(false);

  showForm = signal(false);
  editingRoleId = signal<number | null>(null);

  formName = signal('');
  formDescription = signal('');
  formPermissions = signal<string[]>([]);

  ngOnInit() {
    this.loadRoles();
    this.loadPermissions();
  }

  loadRoles() {
    this.loading.set(true);
    this.rolesService.getRoles().subscribe({
      next: (data) => {
        this.roles.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Errore caricamento ruoli');
        this.loading.set(false);
      },
    });
  }

  loadPermissions() {
    this.rolesService.getPermissions().subscribe({
      next: (data) => this.permissionGroups.set(data),
      error: () => this.toast.error('Errore caricamento permessi'),
    });
  }

  openCreate() {
    this.editingRoleId.set(null);
    this.formName.set('');
    this.formDescription.set('');
    this.formPermissions.set([]);
    this.showForm.set(true);
  }

  openEdit(role: Role) {
    this.editingRoleId.set(role.id);
    this.formName.set(role.name);
    this.formDescription.set(role.description ?? '');
    this.formPermissions.set([...role.permissions]);
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
    this.editingRoleId.set(null);
  }

  togglePermission(perm: string) {
    const current = this.formPermissions();
    if (current.includes(perm)) {
      this.formPermissions.set(current.filter((p) => p !== perm));
    } else {
      this.formPermissions.set([...current, perm]);
    }
  }

  isChecked(perm: string): boolean {
    return this.formPermissions().includes(perm);
  }

  saveRole() {
    const name = this.formName().trim();
    if (!name) {
      this.toast.warning('Inserisci un nome per il ruolo');
      return;
    }

    const dto = {
      name,
      description: this.formDescription().trim() || undefined,
      permissions: this.formPermissions(),
    };

    const id = this.editingRoleId();
    if (id) {
      this.rolesService.updateRole(id, dto).subscribe({
        next: () => {
          this.toast.success('Ruolo aggiornato');
          this.loadRoles();
          this.closeForm();
        },
        error: (err: any) => {
          this.toast.error(err.error?.message || 'Errore aggiornamento ruolo');
        },
      });
    } else {
      this.rolesService.createRole(dto).subscribe({
        next: () => {
          this.toast.success('Ruolo creato');
          this.loadRoles();
          this.closeForm();
        },
        error: (err: any) => {
          this.toast.error(err.error?.message || 'Errore creazione ruolo');
        },
      });
    }
  }

  deleteRole(id: number) {
    if (!confirm('Sei sicuro di voler eliminare questo ruolo?')) return;
    this.rolesService.deleteRole(id).subscribe({
      next: () => {
        this.toast.success('Ruolo eliminato');
        this.loadRoles();
      },
      error: (err: any) => {
        this.toast.error(err.error?.message || 'Errore eliminazione ruolo');
      },
    });
  }

  canCreate(): boolean {
    return this.auth.hasPermission('role:create');
  }

  canUpdate(): boolean {
    return this.auth.hasPermission('role:update');
  }

  canDelete(): boolean {
    return this.auth.hasPermission('role:delete');
  }
}

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../core/services/users.service';
import { RolesService } from '../../core/services/roles.service';
import { ToastService } from '../../core/services/toast.service';
import { User, Role } from '../../core/models/user.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  private usersService = inject(UsersService);
  private rolesService = inject(RolesService);
  private toast = inject(ToastService);

  users = signal<User[]>([]);
  roles = signal<Role[]>([]);
  loading = signal(false);

  editingUserId = signal<number | null>(null);
  showForm = signal(false);

  formUsername = signal('');
  formPassword = signal('');
  formFullName = signal('');
  formRoleId = signal<number>(0);
  formCompanyId = signal(1);
  formIsActive = signal(true);

  isEditing = computed(() => this.editingUserId() !== null);

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.usersService.getAll().subscribe({
      next: (data) => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Errore caricamento utenti');
        this.loading.set(false);
      },
    });
  }

  loadRoles(): void {
    this.rolesService.getRoles().subscribe({
      next: (data) => {
        this.roles.set(data);
        // Se nessun ruolo selezionato, pre-seleziona il primo
        if (this.formRoleId() === 0 && data.length > 0) {
          this.formRoleId.set(data[0].id);
        }
      },
      error: () => this.toast.error('Errore caricamento ruoli'),
    });
  }

  openCreateForm(): void {
    this.editingUserId.set(null);
    this.formUsername.set('');
    this.formPassword.set('');
    this.formFullName.set('');
    this.formRoleId.set(this.roles()[0]?.id ?? 0);
    this.formCompanyId.set(1);
    this.formIsActive.set(true);
    this.showForm.set(true);
  }

  openEditForm(user: User): void {
    this.editingUserId.set(user.id);
    this.formUsername.set(user.username);
    this.formPassword.set('');
    this.formFullName.set(user.fullName);
    this.formRoleId.set(user.roleId);
    this.formCompanyId.set(user.companyId);
    this.formIsActive.set(user.isActive);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingUserId.set(null);
  }

  saveUser(): void {
    const username = this.formUsername().trim();
    const fullName = this.formFullName().trim();
    const roleId = this.formRoleId();
    const password = this.formPassword();

    if (!username || !fullName || (!this.isEditing() && !password)) {
      this.toast.warning('Username, nome completo e password sono obbligatori');
      return;
    }

    if (!roleId) {
      this.toast.warning('Seleziona un ruolo');
      return;
    }

    this.loading.set(true);
    const id = this.editingUserId();

    if (id) {
      const payload: any = {
        fullName,
        roleId,
        isActive: this.formIsActive(),
        companyId: this.formCompanyId(),
      };
      if (password) payload.password = password;

      this.usersService.update(id, payload).subscribe({
        next: () => {
          this.toast.success('Utente aggiornato');
          this.loading.set(false);
          this.loadUsers();
          this.closeForm();
        },
        error: (err: any) => {
          this.toast.error(err.error?.message || 'Errore aggiornamento utente');
          this.loading.set(false);
        },
      });
    } else {
      this.usersService
        .create({
          username,
          password,
          fullName,
          roleId,
          companyId: this.formCompanyId(),
          isActive: this.formIsActive(),
        })
        .subscribe({
          next: () => {
            this.toast.success('Utente creato');
            this.loading.set(false);
            this.loadUsers();
            this.closeForm();
          },
          error: (err: any) => {
            this.toast.error(err.error?.message || 'Errore creazione utente');
            this.loading.set(false);
          },
        });
    }
  }

  deleteUser(id: number): void {
    if (!confirm('Sei sicuro di voler eliminare questo utente?')) return;
    this.loading.set(true);
    this.usersService.delete(id).subscribe({
      next: () => {
        this.toast.success('Utente eliminato');
        this.loading.set(false);
        this.loadUsers();
      },
      error: (err: any) => {
        this.toast.error(err.error?.message || 'Errore eliminazione utente');
        this.loading.set(false);
      },
    });
  }
}

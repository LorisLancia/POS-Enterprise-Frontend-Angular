import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../core/services/users.service';
import { User, UserRole } from '../../core/models/user.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent implements OnInit {
  users = signal<User[]>([]);
  loading = signal(false);
  error = signal('');

  editingUser = signal<Partial<User> | null>(null);
  showForm = signal(false);

  formData = {
    username: '',
    password: '',
    fullName: '',
    role: 'CASHIER' as UserRole,
    isActive: true,
    storeId: 1,
  };

  isEditing = computed(() => this.editingUser() !== null);
  roles: UserRole[] = ['ADMIN', 'MANAGER', 'CASHIER'];

  constructor(private usersService: UsersService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.error.set('');
    this.usersService.getAll().subscribe({
      next: (data: User[]) => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set('Error loading users: ' + (err.message || 'Unknown error'));
        this.loading.set(false);
      },
    });
  }

  refresh(): void {
    this.loadUsers();
  }

  openCreateForm(): void {
    this.editingUser.set(null);
    this.formData = {
      username: '',
      password: '',
      fullName: '',
      role: 'CASHIER',
      isActive: true,
      storeId: 1,
    };
    this.showForm.set(true);
  }

  openEditForm(user: User): void {
    this.editingUser.set(user);
    this.formData = {
      username: user.username,
      password: '',
      fullName: user.fullName,
      role: user.role.name as UserRole,
      isActive: user.isActive,
      storeId: user.storeId,
    };
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingUser.set(null);
  }

  saveUser(): void {
    if (
      !this.formData.username ||
      !this.formData.fullName ||
      (!this.isEditing() && !this.formData.password)
    ) {
      this.error.set('Username, full name and password are required');
      return;
    }

    this.loading.set(true);
    if (this.isEditing() && this.editingUser()?.id) {
      const payload: any = {
        fullName: this.formData.fullName,
        role: this.formData.role,
        isActive: this.formData.isActive,
        storeId: this.formData.storeId,
      };
      if (this.formData.password) payload.password = this.formData.password;

      this.usersService.update(this.editingUser()!.id!, payload).subscribe({
        next: () => {
          this.loading.set(false);
          this.loadUsers();
          this.closeForm();
        },
        error: (err: any) => {
          this.loading.set(false);
          this.error.set('Error updating: ' + err.message);
        },
      });
    } else {
      this.usersService
        .create({
          username: this.formData.username,
          password: this.formData.password,
          fullName: this.formData.fullName,
          role: this.formData.role,
          isActive: this.formData.isActive,
          storeId: this.formData.storeId,
        })
        .subscribe({
          next: () => {
            this.loading.set(false);
            this.loadUsers();
            this.closeForm();
          },
          error: (err: any) => {
            this.loading.set(false);
            this.error.set('Error creating: ' + err.message);
          },
        });
    }
  }

  deleteUser(id: number): void {
    if (!confirm('Are you sure you want to delete this user?')) return;
    this.loading.set(true);
    this.usersService.delete(id).subscribe({
      next: () => {
        this.loading.set(false);
        this.loadUsers();
      },
      error: (err: any) => {
        this.loading.set(false);
        this.error.set('Error deleting: ' + err.message);
      },
    });
  }
}

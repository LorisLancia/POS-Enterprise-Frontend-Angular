export interface Role {
  id: number;
  name: string;
  description: string | null;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  _count?: {
    users: number;
  };
}

export interface PermissionGroup {
  category: string;
  permissions: string[];
}

export interface CreateRoleDto {
  name: string;
  description?: string;
  permissions: string[];
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  permissions?: string[];
}

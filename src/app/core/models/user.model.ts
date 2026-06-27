export interface Role {
  id: number;
  name: string;
  description: string | null;
}

export interface User {
  id: number;
  username: string;
  fullName: string;
  role: Role;
  roleId: number;
  isActive: boolean;
  companyId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  username: string;
  password: string;
  fullName: string;
  roleId: number;
  companyId: number;
  isActive?: boolean;
}

export interface UpdateUserDto {
  username?: string;
  password?: string;
  fullName?: string;
  roleId?: number;
  companyId?: number;
  isActive?: boolean;
}

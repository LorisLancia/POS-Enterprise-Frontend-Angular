// src/app/core/models/auth.model.ts
export interface AuthUser {
  id: number;
  username: string;
  full_name: string;
  role: string;
  permissions: string[];
}

export interface LoginResponse {
  access_token: string;
  user: AuthUser;
}

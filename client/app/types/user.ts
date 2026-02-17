import { type Timestamp } from "./common.ts";

export interface User {
  id: number;
  username: string;
  domain: string | null;
  email: string;
  email_confirmation_token: string | null;
  email_confirmed_at: Timestamp | null;
  password_hash: string; // solo para backend, no se expone normalmente
  display_name: string | null;
  biography: string | null;
  language: string; // ej. 'es', 'en'
  locale: string; // ej. 'es-ES'
  timezone: string;
  profile_picture: number | null; // FK a media
  banner_picture: number | null; // FK a media
  is_banned: boolean;
  is_disabled: boolean;
  stripe_account_id: string | null;
  last_login_at: Timestamp | null;
  registered_at: Timestamp;
  updated_at: Timestamp;
}

export interface Role {
  id: number;
  name: string; // ej. 'admin', 'moderator', 'artist', 'user'
  description: string | null;
  created_at: Timestamp;
}

export interface UserRole {
  user_id: number;
  role_id: number;
  assigned_at: Timestamp;
  assigned_by: number | null; // FK a user
}

export interface Permission {
  id: number;
  name: string;
  scope_id: number | null; // FK a scope
  description: string | null;
}

export interface RolePermission {
  role_id: number;
  permission_id: number;
}

export interface Scope {
  id: number;
  name: string; // ej. 'users', 'posts', 'payments'
}

export interface Follow {
  source_user_id: number;
  target_user_id: number;
  followed_at: Timestamp;
}

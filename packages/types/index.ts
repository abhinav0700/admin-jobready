export interface College {
  id: string;
  name: string;
  domain: string;
  is_active: boolean;
  created_at: string;
  user_count?: number;
}

export interface User {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  college_id: string | null;
  is_password_changed: boolean;
  role: 'admin' | 'college_admin' | 'student';
  created_at: string;
  colleges?: College | null; // for joined college relation
}

export interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  metadata: any;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  forceReset?: boolean;
}

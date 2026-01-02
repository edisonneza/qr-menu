//user model
export interface User {
  id: number;
  tenant_id: number;
  name: string;
  email: string;
  password?: string; // Only for create/update
  role: 'admin' | 'manager' | 'staff';
  is_active: boolean;
  phone?: string;
  created_at: string;
  last_login_at?: string;
  updated_at: string;
}
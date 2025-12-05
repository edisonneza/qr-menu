//user model
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  tenant_id?: number;
  isActive: boolean;
  created_by: string;
  created_at: string;
  updated_by: string;
  updated_at: string;
}
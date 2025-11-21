//user model
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  tenant_id?: number;
//   created_at: string;
//   updated_at: string;
}
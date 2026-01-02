// models/Role.ts
import { UserClaim } from './Claim';

export type RoleName = 'admin' | 'manager' | 'staff';

export interface Role {
  role: RoleName;
  title: string;
  description: string;
  color: 'error' | 'warning' | 'info' | 'default';
  claim_count: number;
  user_count: number;
}

export interface RoleWithClaims extends Role {
  total_users: number;
  active_users: number;
  claims: {
    id: number;
    name: string;
    resource: string;
    action: string;
    description: string;
  }[];
  detailed_claims: UserClaim[];
}

export interface RoleUser {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

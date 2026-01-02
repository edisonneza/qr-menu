// models/Claim.ts
export interface Claim {
  id: number;
  name: string;
  resource: string;
  action: string;
  description: string;
}

export interface UserClaim extends Claim {
  has_claim: boolean;
  source: 'role_default' | 'override' | 'none';
  granted_by?: number;
  granted_at?: string;
}

export interface ClaimAuditLog {
  id: number;
  action: 'granted' | 'revoked';
  previous_value: boolean | null;
  new_value: boolean;
  created_at: string;
  claim_name: string;
  claim_description: string;
  modified_by_name: string;
  modified_by_email: string;
}

export interface UserClaimsData {
  user_id: number;
  user_name: string;
  user_role: string;
  claims: UserClaim[];
  audit_log: ClaimAuditLog[];
}

export interface ClaimsGrouped {
  [resource: string]: Claim[];
}

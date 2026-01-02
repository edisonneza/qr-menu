// api/role/RoleApi.ts
import api from "../axios";
import { Role, RoleWithClaims, RoleName, RoleUser } from "../../models/Role";

/**
 * Get all roles
 */
const getRoles = async (): Promise<{ items: Role[]; itemCount: number }> => {
  const r = await api.get("/admin/roles");
  return r.data.data;
};

/**
 * Get specific role with claims
 */
const getRoleById = async (role: RoleName): Promise<RoleWithClaims> => {
  const r = await api.get(`/admin/roles/${role}`);
  return r.data.data;
};

/**
 * Update role's claims
 */
const updateRoleClaims = async (
  role: RoleName,
  claimIds: number[]
): Promise<RoleWithClaims> => {
  const r = await api.put(`/admin/roles/${role}/claims`, {
    claim_ids: claimIds,
  });
  return r.data.data;
};

/**
 * Update role metadata (title, description, color)
 */
const updateRoleMetadata = async (
  role: RoleName,
  data: { title?: string; description?: string; color?: string }
): Promise<RoleWithClaims> => {
  const r = await api.put(`/admin/roles/${role}/metadata`, data, {
    params: { metadata: "true" },
  });
  return r.data.data;
};

/**
 * Get users assigned to a role
 */
const getRoleUsers = async (role: RoleName): Promise<RoleUser[]> => {
  const r = await api.get(`/admin/roles/${role}/users`, {
    params: { users: "true" },
  });
  return r.data.data.users;
};

export { getRoles, getRoleById, updateRoleClaims, updateRoleMetadata, getRoleUsers };

// api/claims/ClaimsApi.ts
import api from "../axios";
import { Claim, ClaimsGrouped, UserClaimsData } from "../../models/Claim";

/**
 * Get all available claims in the system
 */
const getAllClaims = async (): Promise<{
  grouped: ClaimsGrouped;
  flat: Claim[];
}> => {
  const r = await api.get("/admin/claims");
  return r.data.data;
};

/**
 * Get claims for a specific user (with role defaults and overrides)
 */
const getUserClaims = async (userId: number): Promise<UserClaimsData> => {
  const r = await api.get(`/admin/users/${userId}/claims`);
  return r.data.data;
};

/**
 * Update user's claims
 */
const updateUserClaims = async (
  userId: number,
  claimIds: number[]
): Promise<UserClaimsData> => {
  const r = await api.put(`/admin/users/${userId}/claims`, {
    claim_ids: claimIds,
  });
  return r.data.data;
};

/**
 * Get current user's claims (for permission checking in UI)
 */
const getMyClaims = async (): Promise<string[]> => {
  const r = await api.get("/auth/me/claims", {
    params: { me: "true" },
  });
  return r.data.data.claims;
};

export { getAllClaims, getUserClaims, updateUserClaims, getMyClaims };

import { getOrganizationRuntimeSnapshot } from "./foundation";
import type { MembershipRuntimeModel } from "./types";

export const MembershipRuntimeService = {
  listMemberships(): MembershipRuntimeModel[] {
    return getOrganizationRuntimeSnapshot().memberships;
  },

  getMembership(id: string): MembershipRuntimeModel | undefined {
    return getOrganizationRuntimeSnapshot().memberships.find(
      (membership) => membership.identity.id === id,
    );
  },
};

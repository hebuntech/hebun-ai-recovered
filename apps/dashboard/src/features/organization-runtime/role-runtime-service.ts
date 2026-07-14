import { getOrganizationRuntimeSnapshot } from "./foundation";
import type { RoleRuntimeModel } from "./types";

export const RoleRuntimeService = {
  listRoles(): RoleRuntimeModel[] {
    return getOrganizationRuntimeSnapshot().roles;
  },

  getRole(id: string): RoleRuntimeModel | undefined {
    return getOrganizationRuntimeSnapshot().roles.find((role) => role.identity.id === id);
  },
};

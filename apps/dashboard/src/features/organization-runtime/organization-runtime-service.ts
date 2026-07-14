import { getOrganizationRuntimeSnapshot } from "./foundation";
import type { CompanyRuntimeModel, OrganizationRuntimeModel } from "./types";

export const OrganizationRuntimeService = {
  getCompany(): CompanyRuntimeModel {
    return getOrganizationRuntimeSnapshot().company;
  },

  listOrganizations(): OrganizationRuntimeModel[] {
    return getOrganizationRuntimeSnapshot().organizations;
  },

  getOrganization(id: string): OrganizationRuntimeModel | undefined {
    return getOrganizationRuntimeSnapshot().organizations.find(
      (organization) => organization.identity.id === id,
    );
  },
};

import { getOrganizationRuntimeSnapshot } from "./foundation";
import type { DepartmentRuntimeModel } from "./types";

export const DepartmentRuntimeService = {
  listDepartments(): DepartmentRuntimeModel[] {
    return getOrganizationRuntimeSnapshot().departments;
  },

  getDepartment(id: string): DepartmentRuntimeModel | undefined {
    return getOrganizationRuntimeSnapshot().departments.find(
      (department) => department.identity.id === id,
    );
  },
};

import { getOrganizationRuntimeSnapshot } from "./foundation";
import type { HierarchyNodeRuntimeModel } from "./types";

export const HierarchyRuntimeService = {
  listNodes(): HierarchyNodeRuntimeModel[] {
    return getOrganizationRuntimeSnapshot().hierarchy;
  },

  getNode(id: string): HierarchyNodeRuntimeModel | undefined {
    return getOrganizationRuntimeSnapshot().hierarchy.find((node) => node.identity.id === id);
  },

  getChildren(parentId: string): HierarchyNodeRuntimeModel[] {
    return getOrganizationRuntimeSnapshot().hierarchy.filter(
      (node) => node.parent?.id === parentId,
    );
  },
};

import { getOrganizationRuntimeSnapshot } from "./foundation";
import type { HumanRuntimeModel } from "./types";

export const HumanRuntimeService = {
  listHumans(): HumanRuntimeModel[] {
    return getOrganizationRuntimeSnapshot().humans;
  },

  getHuman(id: string): HumanRuntimeModel | undefined {
    return getOrganizationRuntimeSnapshot().humans.find(
      (human) => human.identity.id === id,
    );
  },
};

import {
  ensureRuntimeProjectionRegistry,
  runtimeProjectionRegistry,
} from "@/features/runtime-projection";
import { departmentMatchesStrategicLabel } from "@/features/executive-runtime-support/department-matching";
import type { MissionRuntimeModel } from "./types";

export const MissionRuntimeService = {
  listMissions(): MissionRuntimeModel[] {
    ensureRuntimeProjectionRegistry();
    return runtimeProjectionRegistry.ensure<MissionRuntimeModel[]>("mission-runtime").data;
  },

  listMissionsForDepartment(department: string): MissionRuntimeModel[] {
    const missions = MissionRuntimeService.listMissions();
    const matched = missions.filter(
      (mission) =>
        mission.focusDepartments.includes(department.toLowerCase()) ||
        departmentMatchesStrategicLabel(
          `${mission.title} ${mission.description}`,
          department,
        ),
    );

    return matched.length > 0 ? matched : missions;
  },

  getMission(id: string): MissionRuntimeModel | undefined {
    return MissionRuntimeService.listMissions().find((mission) => mission.id === id);
  },

  getPrimaryMissionForDepartment(department: string): MissionRuntimeModel | undefined {
    return MissionRuntimeService.listMissionsForDepartment(department)[0];
  },
};

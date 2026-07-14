import { permissionConflicts, permissionMatrix, permissionRoles } from "@/features/governance/permissions";
import type { PermissionResult } from "@/features/policy/types";
import type { ReasoningResult } from "@/features/reasoning";

const actorRole: PermissionResult["role"] = "Director";

export function evaluatePermissions(reasoning: ReasoningResult): PermissionResult[] {
  const hasConflict = permissionConflicts.some((conflict) => conflict.severity === "error");
  const directorAllows = permissionMatrix.some((row) => row.director === "allow");
  const highPrivilege = permissionRoles.find((role) => role.role === "Director");

  return [
    {
      role: actorRole,
      status: hasConflict ? "watch" : directorAllows ? "pass" : "fail",
      detail:
        hasConflict
          ? "Director-level progression is permitted, but open permission conflicts require secondary review."
          : directorAllows
            ? `Director role with ${highPrivilege?.privilege ?? "high"} privilege can authorize this recommendation path.`
            : "The current role cannot authorize the requested action path.",
      allowedActions: reasoning.selectedOption.actions.filter(
        (action) => !action.toLowerCase().includes("expand")
      ),
      blockedActions: reasoning.selectedOption.actions.filter((action) =>
        action.toLowerCase().includes("expand")
      ),
    },
  ];
}

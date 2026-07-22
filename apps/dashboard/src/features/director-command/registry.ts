import { COMMAND_DEFINITION_VERSION, DIRECTOR_COMMAND_DEFINITIONS } from "./definitions";
import {
  COMMAND_CAPABILITIES,
  COMMAND_CATEGORIES,
  COMMAND_PRIVILEGES,
  COMMAND_RISK_LEVELS,
  DIRECTOR_COMMAND_IDS,
  type DirectorCommandDefinition,
} from "./types";
import { containsNoBehaviour, deepFreeze, validText, validVersion } from "./validation";
import { NAVIGABLE_SECTION_IDS } from "../director-dashboard-navigation";

export type CommandResolution =
  | { readonly status: "resolved"; readonly command: DirectorCommandDefinition }
  | { readonly status: "unknown_command"; readonly commandId: string; readonly version: string };

function validate(input: DirectorCommandDefinition): DirectorCommandDefinition {
  if (
    !(DIRECTOR_COMMAND_IDS as readonly string[]).includes(input.commandId) ||
    !validVersion(input.version) ||
    !validText(input.label) || !validText(input.description) ||
    !(COMMAND_CATEGORIES as readonly string[]).includes(input.category) ||
    !(COMMAND_RISK_LEVELS as readonly string[]).includes(input.risk) ||
    !(NAVIGABLE_SECTION_IDS as readonly string[]).includes(input.targetSectionId) ||
    !(COMMAND_CAPABILITIES as readonly string[]).includes(input.permission.capability) ||
    !(COMMAND_PRIVILEGES as readonly string[]).includes(input.permission.minimumPrivilege) ||
    typeof input.permission.requiresApproval !== "boolean" ||
    // A command that claims to be executable cannot be registered in this phase.
    input.executable !== false ||
    // Definitions are data: any function value is rejected outright.
    !containsNoBehaviour(input)
  ) {
    throw new TypeError("Invalid director command definition.");
  }
  return deepFreeze({ ...input, permission: { ...input.permission } });
}

/**
 * Immutable command registry.
 *
 * Constructed from a fixed set of definitions and frozen — there is no
 * `register` mutator, so the catalogue cannot drift at runtime. The registry
 * resolves and lists declarations; it never invokes anything.
 */
export class DirectorCommandRegistry {
  readonly #entries: ReadonlyMap<string, DirectorCommandDefinition>;

  constructor(entries: readonly DirectorCommandDefinition[]) {
    const mapped = new Map<string, DirectorCommandDefinition>();
    for (const input of entries) {
      const command = validate(input);
      const key = DirectorCommandRegistry.key(command.commandId, command.version);
      if (mapped.has(key)) throw new TypeError("Duplicate director command definition.");
      mapped.set(key, command);
    }
    this.#entries = mapped;
    Object.freeze(this);
  }

  resolve(commandId: string, version: string): CommandResolution {
    const command = this.#entries.get(DirectorCommandRegistry.key(commandId, version));
    return command
      ? Object.freeze({ status: "resolved", command })
      : Object.freeze({ status: "unknown_command", commandId, version });
  }

  list(): readonly DirectorCommandDefinition[] {
    return Object.freeze([...this.#entries.values()]);
  }

  /** Declared commands for one dashboard section, in registration order. */
  listForSection(sectionId: string): readonly DirectorCommandDefinition[] {
    return Object.freeze(this.list().filter((command) => command.targetSectionId === sectionId));
  }

  private static key(commandId: string, version: string): string {
    return `${commandId}@${version}`;
  }
}

export function createDefaultCommandRegistry(): DirectorCommandRegistry {
  return new DirectorCommandRegistry(DIRECTOR_COMMAND_DEFINITIONS);
}

export { COMMAND_DEFINITION_VERSION };

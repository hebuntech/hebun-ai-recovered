import { DASHBOARD_DATA_SOURCES, DASHBOARD_SECTION_IDS, type DashboardSectionDefinition } from "./types";
import { deepFreeze, validText, validVersion } from "./validation";

export type DashboardSectionResolution =
  | { readonly status: "resolved"; readonly section: DashboardSectionDefinition }
  | { readonly status: "unknown_section"; readonly sectionId: string; readonly version: string };

export type DashboardSectionRegistration =
  | { readonly status: "registered"; readonly registry: DashboardRegistry }
  | { readonly status: "duplicate" | "invalid"; readonly sectionId: string; readonly version: string };

function validate(input: DashboardSectionDefinition): DashboardSectionDefinition {
  if (!(DASHBOARD_SECTION_IDS as readonly string[]).includes(input.sectionId) || !validVersion(input.version) ||
      !validText(input.owner) || !["active", "deprecated", "retired"].includes(input.lifecycle) ||
      input.supportedWidgets.length === 0 || input.supportedWidgets.some((widget) => !validText(widget)) ||
      new Set(input.supportedWidgets).size !== input.supportedWidgets.length || input.requiredDataSources.length === 0 ||
      input.requiredDataSources.some((source) => !(DASHBOARD_DATA_SOURCES as readonly string[]).includes(source)) ||
      new Set(input.requiredDataSources).size !== input.requiredDataSources.length) {
    throw new TypeError("Invalid dashboard section definition.");
  }
  return deepFreeze({ ...input, supportedWidgets: [...input.supportedWidgets], requiredDataSources: [...input.requiredDataSources] });
}

export class DashboardRegistry {
  readonly #entries: ReadonlyMap<string, DashboardSectionDefinition>;

  constructor(entries: readonly DashboardSectionDefinition[]) {
    const mapped = new Map<string, DashboardSectionDefinition>();
    for (const input of entries) {
      const section = validate(input);
      const key = DashboardRegistry.key(section.sectionId, section.version);
      if (mapped.has(key)) throw new TypeError("Duplicate dashboard section definition.");
      mapped.set(key, section);
    }
    this.#entries = mapped;
    Object.freeze(this);
  }

  resolve(sectionId: string, version: string): DashboardSectionResolution {
    const section = this.#entries.get(DashboardRegistry.key(sectionId, version));
    if (!section || section.lifecycle === "retired") return Object.freeze({ status: "unknown_section", sectionId, version });
    return Object.freeze({ status: "resolved", section });
  }

  list(): readonly DashboardSectionDefinition[] {
    return Object.freeze([...this.#entries.values()]);
  }

  register(input: DashboardSectionDefinition): DashboardSectionRegistration {
    if (this.#entries.has(DashboardRegistry.key(input.sectionId, input.version))) {
      return Object.freeze({ status: "duplicate", sectionId: input.sectionId, version: input.version });
    }
    try {
      return Object.freeze({ status: "registered", registry: new DashboardRegistry([...this.list(), input]) });
    } catch {
      return Object.freeze({ status: "invalid", sectionId: input.sectionId, version: input.version });
    }
  }

  private static key(sectionId: string, version: string): string {
    return `${sectionId}@${version}`;
  }
}

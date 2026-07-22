import { RUNTIME_ADAPTER_AVAILABILITY_STATES, type RuntimeAdapterDescriptor } from "./runtime-adapter-framework";
import { deepFreeze, validText } from "./validation";

function validDescriptor(value: RuntimeAdapterDescriptor): boolean {
  return validText(value.adapterId) && value.adapterFamily === value.supportedTargetFamily &&
    value.adapterVersion === "1.0.0" && value.architectureSource === "static-architecture" &&
    (RUNTIME_ADAPTER_AVAILABILITY_STATES as readonly string[]).includes(value.availability) &&
    value.executable === false && value.authoritative === false && value.supportedCommandFamilies.length > 0 && value.capabilityRequirements.length > 0;
}

/** Immutable metadata registry. It has no adapter instances or dependency container. */
export class RuntimeAdapterRegistry {
  readonly #descriptors: readonly RuntimeAdapterDescriptor[];
  constructor(input: { readonly descriptors: readonly RuntimeAdapterDescriptor[] }) {
    const families = new Set<string>();
    const descriptors = input.descriptors.map((entry) => {
      if (!validDescriptor(entry) || families.has(entry.adapterFamily)) throw new TypeError("Invalid Runtime adapter registry.");
      families.add(entry.adapterFamily);
      return deepFreeze({ ...entry, supportedCommandFamilies: [...entry.supportedCommandFamilies], capabilityRequirements: [...entry.capabilityRequirements] });
    });
    this.#descriptors = Object.freeze(descriptors);
    Object.freeze(this);
  }
  list(): readonly RuntimeAdapterDescriptor[] { return this.#descriptors; }
  forTargetFamily(targetFamily: RuntimeAdapterDescriptor["supportedTargetFamily"]): readonly RuntimeAdapterDescriptor[] {
    return Object.freeze(this.#descriptors.filter((descriptor) => descriptor.supportedTargetFamily === targetFamily));
  }
}

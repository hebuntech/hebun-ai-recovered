import type { DirectorCommandRegistry } from "./registry";
import type { RuntimeExecutionArchitectureValidation, } from "./runtime-execution-validator";
import { validateRuntimeExecutionArchitecture } from "./runtime-execution-validator";
import type { RuntimeExecutionAuthority, RuntimeExecutionRequest } from "./runtime-execution-contracts";

/**
 * The sole future entry to Runtime execution architecture. It accepts only an
 * already constructed request and performs validation only—never adapter work.
 */
export class RuntimeExecutionGateway {
  readonly #registry: DirectorCommandRegistry;

  constructor(input: { readonly registry: DirectorCommandRegistry }) {
    this.#registry = input.registry;
    Object.freeze(this);
  }

  validate(input: { readonly request: RuntimeExecutionRequest; readonly authority?: RuntimeExecutionAuthority }): RuntimeExecutionArchitectureValidation {
    return validateRuntimeExecutionArchitecture({ registry: this.#registry, ...input });
  }
}

/*
 * Agent CRUD — first-class agent registry data layer.
 */

export * from "./types";
export * from "./agent-service";
export * from "./agent-projections";
export { getSnapshot, subscribe, resetStore } from "./agent-adapter";

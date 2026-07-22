import type { CommandAuthorityContext } from "./types";

/**
 * The authority the dashboard presents today: none.
 *
 * No identity or role model exists yet, so the dashboard cannot truthfully
 * claim any capability. Presenting an empty authority makes every command
 * render as permission-required, which is an accurate statement of the
 * current state — claiming otherwise would imply an authorization that has
 * never been established.
 *
 * A later phase that introduces a real authority model replaces this; nothing
 * downstream has to change, because the presentation is derived from whatever
 * authority it is handed.
 */
export const UNRESOLVED_COMMAND_AUTHORITY: CommandAuthorityContext = Object.freeze({
  privilege: "baseline",
  capabilities: Object.freeze([]) as readonly [],
});

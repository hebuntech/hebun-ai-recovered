/* Permissions — platform catalog of command-scoped rights (global). */
import { pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import { rootColumns } from "./_base";
import { permissionScopeEnum } from "./_enums";

export const permissions = pgTable(
  "permissions",
  {
    ...rootColumns,
    key: text("key").notNull(),
    scope: permissionScopeEnum("scope").notNull(),
    description: text("description"),
  },
  (t) => [uniqueIndex("permissions_key_uq").on(t.key)]
);

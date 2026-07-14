/* Providers — platform catalog (Claude, Codex, GitHub, …). Global. */
import { pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import { rootColumns } from "./_base";
import { providerStatusEnum } from "./_enums";

export const providers = pgTable(
  "providers",
  {
    ...rootColumns,
    key: text("key").notNull(),
    name: text("name").notNull(),
    status: providerStatusEnum("status").notNull().default("simulation"),
  },
  (t) => [uniqueIndex("providers_key_uq").on(t.key)]
);

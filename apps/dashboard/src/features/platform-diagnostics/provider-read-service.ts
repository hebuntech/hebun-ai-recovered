import { listRegisteredPersistenceProviders } from "@/features/persistence/provider-registry";
import type { PersistenceProviderDescriptor } from "@/features/persistence/types";

export type { PersistenceProviderDescriptor };

export const ProviderDiagnosticsReadService = {
  listProviders(): Promise<readonly PersistenceProviderDescriptor[]> {
    return listRegisteredPersistenceProviders();
  },
};

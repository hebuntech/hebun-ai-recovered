import type { PersistenceProviderKey } from "@/features/persistence";

export interface CanonicalRepositoryCapabilities {
  readonly read: boolean;
  readonly write: boolean;
  readonly shadow: boolean;
}

export interface CanonicalRepositoryDescriptor {
  readonly repository: string;
  readonly provider: PersistenceProviderKey;
  readonly capabilities: CanonicalRepositoryCapabilities;
  readonly authoritative: boolean;
}

export interface ReadRepository<Query, Result> {
  readonly kind: "read";
  readonly descriptor: CanonicalRepositoryDescriptor;
  findOne(query: Query): Promise<Result>;
}

export interface WriteRepository<Record, CreateInput = Record, UpdateInput = Partial<Record>> {
  readonly kind: "write";
  readonly descriptor: CanonicalRepositoryDescriptor;
  create(input: CreateInput): Promise<Record>;
  update(id: string, input: UpdateInput): Promise<Record | undefined>;
  archive(id: string): Promise<Record | undefined>;
  restore(id: string): Promise<Record | undefined>;
  softDelete(id: string): Promise<Record | undefined>;
}

export interface ShadowRepository<Query, Result> {
  readonly kind: "shadow";
  readonly descriptor: CanonicalRepositoryDescriptor;
  isAvailable(): Promise<boolean>;
  findShadow(query: Query): Promise<Result>;
}

export interface CanonicalRepositoryDiagnosticsView {
  readonly repository: string;
  readonly authoritativeProvider: PersistenceProviderKey;
  readonly authoritativeCapabilities: CanonicalRepositoryCapabilities;
  readonly shadowProvider: PersistenceProviderKey;
  readonly shadowCapabilities: CanonicalRepositoryCapabilities;
  readonly readSource: PersistenceProviderKey;
  readonly shadowAvailable: boolean;
}

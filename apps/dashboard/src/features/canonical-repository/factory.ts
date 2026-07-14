import type {
  CanonicalRepositoryCapabilities,
  CanonicalRepositoryDescriptor,
  ReadRepository,
  ShadowRepository,
  WriteRepository,
} from "./types";

function cloneCapabilities(
  capabilities: CanonicalRepositoryCapabilities,
): CanonicalRepositoryCapabilities {
  return { ...capabilities };
}

function createDescriptor(params: CanonicalRepositoryDescriptor): CanonicalRepositoryDescriptor {
  return {
    repository: params.repository,
    provider: params.provider,
    capabilities: cloneCapabilities(params.capabilities),
    authoritative: params.authoritative,
  };
}

export function createReadRepository<Query, Result>(params: {
  readonly descriptor: CanonicalRepositoryDescriptor;
  readonly findOne: (query: Query) => Promise<Result> | Result;
}): ReadRepository<Query, Result> {
  return {
    kind: "read",
    descriptor: createDescriptor(params.descriptor),
    findOne: async (query) => params.findOne(query),
  };
}

export function createShadowRepository<Query, Result>(params: {
  readonly descriptor: CanonicalRepositoryDescriptor;
  readonly isAvailable: () => Promise<boolean> | boolean;
  readonly findShadow: (query: Query) => Promise<Result> | Result;
}): ShadowRepository<Query, Result> {
  return {
    kind: "shadow",
    descriptor: createDescriptor(params.descriptor),
    isAvailable: async () => params.isAvailable(),
    findShadow: async (query) => params.findShadow(query),
  };
}

export function createUnimplementedWriteRepository<
  Record,
  CreateInput = Record,
  UpdateInput = Partial<Record>,
>(descriptor: CanonicalRepositoryDescriptor): WriteRepository<Record, CreateInput, UpdateInput> {
  const fail = async (): Promise<never> => {
    throw new Error("Canonical write repository is not implemented.");
  };

  return {
    kind: "write",
    descriptor: createDescriptor(descriptor),
    create: fail,
    update: fail,
    archive: fail,
    restore: fail,
    softDelete: fail,
  };
}

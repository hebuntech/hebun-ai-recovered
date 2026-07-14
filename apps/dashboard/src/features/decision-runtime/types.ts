import type { ExecutiveListItemRuntimeModel } from "@/features/executive-runtime-support/types";

export interface DecisionRuntimeModel {
  id: string;
  title: string;
  summary: string;
  ownerType: string;
  ownerId: string;
  status: string;
  updatedAt: string;
}

export interface DecisionRuntimeProjection {
  readonly decisions: DecisionRuntimeModel[];
  readonly dashboardItems: ExecutiveListItemRuntimeModel[];
}

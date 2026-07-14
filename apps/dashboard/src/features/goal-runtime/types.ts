export interface GoalRuntimeModel {
  id: string;
  slug: string;
  title: string;
  description: string;
  status: string;
  source: string;
  confidence: number;
  ownerType: string;
  ownerId: string;
  tags: string[];
  updatedAt: string;
}

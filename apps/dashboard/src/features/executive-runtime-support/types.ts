export interface ExecutiveMetricRuntimeModel {
  label: string;
  value: string;
  detail: string;
}

export interface ExecutiveListItemRuntimeModel {
  id: string;
  title: string;
  detail: string;
  meta?: string;
  status?: string;
  href?: string;
}

export interface ExecutiveOverviewRuntimeModel {
  metrics: ExecutiveMetricRuntimeModel[];
  items: ExecutiveListItemRuntimeModel[];
}

export interface ExecutiveTimelineEventRuntimeModel {
  id: string;
  title: string;
  detail: string;
  when: string;
  kind: string;
}

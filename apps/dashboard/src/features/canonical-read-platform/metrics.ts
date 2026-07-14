export interface ReadMetricsSnapshot<Counter extends string> {
  readonly sinkType: "noop" | "in-memory";
  readonly counters: Readonly<Record<Counter, number>>;
  readonly latencySamples: readonly number[];
}

export interface ReadMetricsSink<Counter extends string, Tags> {
  readonly sinkType: "noop" | "in-memory";
  increment(counter: Counter, tags: Tags): void;
  observeLatency(valueMs: number, tags: Tags): void;
  snapshot(): ReadMetricsSnapshot<Counter>;
}

function createCounterRecord<Counter extends string>(
  counters: readonly Counter[],
): Record<Counter, number> {
  return Object.fromEntries(counters.map((counter) => [counter, 0])) as Record<
    Counter,
    number
  >;
}

class NoopReadMetricsSink<Counter extends string, Tags>
  implements ReadMetricsSink<Counter, Tags>
{
  readonly sinkType = "noop" as const;

  constructor(
    private readonly counters: readonly Counter[],
    private readonly sanitizeTags: (tags: Tags) => void,
  ) {}

  increment(_counter: Counter, tags: Tags): void {
    this.sanitizeTags(tags);
  }

  observeLatency(_valueMs: number, tags: Tags): void {
    this.sanitizeTags(tags);
  }

  snapshot(): ReadMetricsSnapshot<Counter> {
    return {
      sinkType: this.sinkType,
      counters: createCounterRecord(this.counters),
      latencySamples: [],
    };
  }
}

class InMemoryReadMetricsSink<Counter extends string, Tags>
  implements ReadMetricsSink<Counter, Tags>
{
  readonly sinkType = "in-memory" as const;
  private readonly counterState: Record<Counter, number>;
  private readonly latencySamples: number[] = [];

  constructor(
    counters: readonly Counter[],
    private readonly sanitizeTags: (tags: Tags) => void,
  ) {
    this.counterState = createCounterRecord(counters);
  }

  increment(counter: Counter, tags: Tags): void {
    this.sanitizeTags(tags);
    this.counterState[counter] += 1;
  }

  observeLatency(valueMs: number, tags: Tags): void {
    this.sanitizeTags(tags);
    if (Number.isFinite(valueMs) && valueMs >= 0) {
      this.latencySamples.push(valueMs);
    }
  }

  snapshot(): ReadMetricsSnapshot<Counter> {
    return {
      sinkType: this.sinkType,
      counters: { ...this.counterState },
      latencySamples: [...this.latencySamples],
    };
  }
}

export function createReadMetricsSink<Counter extends string, Tags>(params: {
  readonly counters: readonly Counter[];
  readonly env?: NodeJS.ProcessEnv;
  readonly sanitizeTags: (tags: Tags) => void;
}): ReadMetricsSink<Counter, Tags> {
  return params.env?.NODE_ENV === "production"
    ? new NoopReadMetricsSink(params.counters, params.sanitizeTags)
    : new InMemoryReadMetricsSink(params.counters, params.sanitizeTags);
}

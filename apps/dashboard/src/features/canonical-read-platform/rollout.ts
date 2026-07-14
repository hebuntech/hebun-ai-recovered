export function stableRolloutUnitInterval(sampleKey: string): number {
  let hash = 2166136261;
  for (let index = 0; index < sampleKey.length; index += 1) {
    hash ^= sampleKey.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0) / 4294967295;
}

export function isDeterministicallySampled(
  sampleKey: string,
  sampleRate: number,
): boolean {
  return stableRolloutUnitInterval(sampleKey) < sampleRate;
}

export function rolloutRateToPercentage(sampleRate: number): number {
  return Math.round(sampleRate * 100);
}

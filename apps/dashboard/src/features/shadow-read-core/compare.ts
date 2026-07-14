export type {
  ReadComparableField as ShadowComparableField,
  ReadNormalizeMode as ShadowNormalizeMode,
} from "@/features/canonical-read-platform";
export {
  compareReadField as compareShadowField,
  deriveReadMatchStatus as deriveShadowMatchStatus,
  normalizeDatetime,
  normalizeIdentifier,
  normalizeJson,
  normalizeText,
  partitionReadComparisons as partitionShadowComparisons,
} from "@/features/canonical-read-platform";

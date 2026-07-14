export function categorizeErrorByMessage<Category extends string>(
  error: unknown,
  categories: readonly {
    readonly match: string;
    readonly category: Category;
  }[],
  fallback: Category,
): Category {
  if (!(error instanceof Error)) {
    return fallback;
  }

  const message = error.message.toLowerCase();
  for (const entry of categories) {
    if (message.includes(entry.match)) {
      return entry.category;
    }
  }

  return fallback;
}

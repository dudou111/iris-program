export function normalizeStringArray(input?: unknown): string[] {
  if (input == null) {
    return [];
  }

  const values = (Array.isArray(input) ? input : [input]).filter(
    (item): item is string => typeof item === 'string',
  );

  const compactValues = values
    .map((item) => item.trim())
    .filter((item) => item && item !== 'null' && item !== 'undefined');

  if (compactValues.length > 1) {
    const mergedValue = compactValues.join(',');

    if (mergedValue.startsWith('[') && mergedValue.endsWith(']')) {
      try {
        const parsed = JSON.parse(mergedValue);
        return normalizeStringArray(parsed);
      } catch {
        // ignore and continue with per-item normalization
      }
    }
  }

  const normalized: string[] = [];

  for (const rawValue of compactValues) {
    const value = rawValue.trim();

    if (value.startsWith('[') && value.endsWith(']')) {
      try {
        const parsed = JSON.parse(value);
        normalized.push(...normalizeStringArray(parsed));
        continue;
      } catch {
        // ignore and continue with fallback parsing
      }
    }

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      const unquoted = value.slice(1, -1).trim();
      if (unquoted && unquoted !== 'null' && unquoted !== 'undefined') {
        normalized.push(unquoted);
      }
      continue;
    }

    normalized.push(value);
  }

  return normalized;
}

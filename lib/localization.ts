// Localization bundle types and utilities for handling multiple .arb files

// =============================================================================
// TYPES
// =============================================================================

/**
 * Core bundle type - translation key maps to locale → string
 * Example: { "helloWorld": { "en": "Hello", "es": "Hola" } }
 */
export type LocalizationBundle = {
  [key: string]: {
    [locale: string]: string;
  };
};

/** Individual translation entry extracted from bundle */
export type TranslationEntry = {
  key: string;
  translations: Record<string, string>;
};

/** Metadata about ARB file (from @-prefixed keys in ARB format) */
export type ArbMetadata = {
  description?: string;
  placeholders?: Record<string, unknown>;
  type?: string;
  context?: string;
};

/** Full state combining bundle + metadata */
export type LocalizationState = {
  bundle: LocalizationBundle;
  metadata: {
    sourceLocale: string;
    targetLocales: string[];
    entryMetadata?: Record<string, ArbMetadata>; // key → metadata from @key entries
    lastModified?: Date;
  };
};

/** Raw ARB file structure */
export type ArbFile = {
  // ARB metadata (@@-prefixed keys at root level)
  "@@locale"?: string;
  "@@context"?: string;
  "@@last_modified"?: string;

  // Translation entries (regular strings) and metadata entries (@-prefixed)
  [key: string]: string | ArbMetadata | undefined;
};

// =============================================================================
// ARB PARSING
// =============================================================================

/**
 * Parse raw ARB file content into structured format
 * Separates translation strings from metadata (@-prefixed keys)
 */
export function parseArbFile(content: string): {
  locale: string;
  translations: Record<string, string>;
  metadata: Record<string, ArbMetadata>;
} {
  const parsed: ArbFile = JSON.parse(content);
  const translations: Record<string, string> = {};
  const metadata: Record<string, ArbMetadata> = {};

  for (const [key, value] of Object.entries(parsed)) {
    // Skip ARB metadata keys (start with @@)
    if (key.startsWith("@@")) continue;

    // Handle metadata entries (start with @)
    if (key.startsWith("@") && typeof value === "object") {
      const originalKey = key.slice(1);
      metadata[originalKey] = value as ArbMetadata;
      continue;
    }

    // Regular translation string
    if (typeof value === "string") {
      translations[key] = value;
    }
  }

  const locale = (parsed["@@locale"] as string) || "unknown";

  return { locale, translations, metadata };
}

// =============================================================================
// BUNDLE CONSTRUCTION
// =============================================================================

/**
 * Merge multiple ARB files into a single LocalizationBundle
 * Each file should be { locale: string, content: string }
 */
export function mergeArbFiles(
  files: Array<{ locale: string; content: string }>,
  options?: { sourceLocale?: string },
): LocalizationState {
  const bundle: LocalizationBundle = {};
  const entryMetadata: Record<string, ArbMetadata> = {};
  const targetLocales: string[] = [];
  const sourceLocale = options?.sourceLocale || files[0]?.locale || "en";

  for (const { locale, content } of files) {
    targetLocales.push(locale);
    const { translations, metadata } = parseArbFile(content);

    // Merge translations into bundle
    for (const [key, value] of Object.entries(translations)) {
      if (!bundle[key]) {
        bundle[key] = {};
      }
      bundle[key][locale] = value;
    }

    // Merge metadata (from source locale or first occurrence)
    for (const [key, meta] of Object.entries(metadata)) {
      if (!entryMetadata[key]) {
        entryMetadata[key] = meta;
      }
    }
  }

  return {
    bundle,
    metadata: {
      sourceLocale,
      targetLocales: [...new Set(targetLocales)],
      entryMetadata:
        Object.keys(entryMetadata).length > 0 ? entryMetadata : undefined,
      lastModified: new Date(),
    },
  };
}

/**
 * Convert LocalizationBundle back to ARB format for a specific locale
 */
export function bundleToArb(
  state: LocalizationState,
  locale: string,
  options?: { includeMetadata?: boolean },
): ArbFile {
  const arb: ArbFile = {
    "@@locale": locale,
  };

  for (const [key, translations] of Object.entries(state.bundle)) {
    if (translations[locale]) {
      arb[key] = translations[locale];

      // Include metadata if available and requested
      if (options?.includeMetadata && state.metadata.entryMetadata?.[key]) {
        arb[`@${key}`] = state.metadata.entryMetadata[key];
      }
    }
  }

  return arb;
}

// =============================================================================
// QUERY UTILITIES
// =============================================================================

/** Get translation for a specific key and locale */
export function t(
  state: LocalizationState,
  key: string,
  locale: string,
): string | undefined {
  return state.bundle[key]?.[locale];
}

/** Get all translations for a key across all locales */
export function getEntry(
  state: LocalizationState,
  key: string,
): TranslationEntry | undefined {
  const translations = state.bundle[key];
  if (!translations) return undefined;

  return {
    key,
    translations: { ...translations },
  };
}

/** Get all keys in the bundle */
export function getKeys(state: LocalizationState): string[] {
  return Object.keys(state.bundle);
}

/** Get all locales in the bundle */
export function getLocales(state: LocalizationState): string[] {
  return state.metadata.targetLocales;
}

// =============================================================================
// VALIDATION & ANALYSIS
// =============================================================================

/** Find keys missing translations for specific locales */
export function findMissingTranslations(
  state: LocalizationState,
  locales?: string[],
): Record<string, string[]> {
  const targetLocales = locales || state.metadata.targetLocales;
  const missing: Record<string, string[]> = {};

  for (const [key, translations] of Object.entries(state.bundle)) {
    const missingForKey = targetLocales.filter((loc) => !translations[loc]);
    if (missingForKey.length > 0) {
      missing[key] = missingForKey;
    }
  }

  return missing;
}

/** Find keys that exist in some locales but not others (orphaned keys) */
export function findOrphanedKeys(state: LocalizationState): {
  key: string;
  hasIn: string[];
  missingIn: string[];
}[] {
  const allLocales = state.metadata.targetLocales;
  const orphaned: Array<{ key: string; hasIn: string[]; missingIn: string[] }> =
    [];

  for (const [key, translations] of Object.entries(state.bundle)) {
    const present = Object.keys(translations);
    const missing = allLocales.filter((loc) => !translations[loc]);

    if (missing.length > 0 && present.length > 0) {
      orphaned.push({ key, hasIn: present, missingIn: missing });
    }
  }

  return orphaned;
}

/** Get completion percentage for each locale */
export function getCompletionStats(
  state: LocalizationState,
): Record<string, number> {
  const totalKeys = Object.keys(state.bundle).length;
  const stats: Record<string, number> = {};

  for (const locale of state.metadata.targetLocales) {
    const translatedCount = Object.values(state.bundle).filter(
      (translations) => translations[locale],
    ).length;
    stats[locale] =
      totalKeys > 0 ? Math.round((translatedCount / totalKeys) * 100) : 0;
  }

  return stats;
}

// =============================================================================
// MODIFICATION
// =============================================================================

/** Add or update a translation */
export function setTranslation(
  state: LocalizationState,
  key: string,
  locale: string,
  value: string,
): LocalizationState {
  return {
    ...state,
    bundle: {
      ...state.bundle,
      [key]: {
        ...state.bundle[key],
        [locale]: value,
      },
    },
    metadata: {
      ...state.metadata,
      lastModified: new Date(),
    },
  };
}

/** Add a new key with translations */
export function addKey(
  state: LocalizationState,
  key: string,
  translations: Record<string, string>,
  metadata?: ArbMetadata,
): LocalizationState {
  const newEntry: Record<string, string> = {};

  for (const locale of state.metadata.targetLocales) {
    newEntry[locale] = translations[locale] || "";
  }

  return {
    ...state,
    bundle: {
      ...state.bundle,
      [key]: newEntry,
    },
    metadata: {
      ...state.metadata,
      entryMetadata: metadata && {
        ...state.metadata.entryMetadata,
        [key]: metadata,
      },
      lastModified: new Date(),
    },
  };
}

/** Remove a key entirely */
export function removeKey(
  state: LocalizationState,
  key: string,
): LocalizationState {
  const { [key]: _, ...restBundle } = state.bundle;
  const { [key]: __, ...restMetadata } = state.metadata.entryMetadata || {};

  return {
    ...state,
    bundle: restBundle,
    metadata: {
      ...state.metadata,
      entryMetadata:
        Object.keys(restMetadata).length > 0 ? restMetadata : undefined,
      lastModified: new Date(),
    },
  };
}

/** Rename a key */
export function renameKey(
  state: LocalizationState,
  oldKey: string,
  newKey: string,
): LocalizationState {
  if (!state.bundle[oldKey]) return state;

  const { [oldKey]: value, ...rest } = state.bundle;
  const metadata = state.metadata.entryMetadata;

  return {
    ...state,
    bundle: {
      ...rest,
      [newKey]: value,
    },
    metadata: {
      ...state.metadata,
      entryMetadata: metadata
        ? {
            ...Object.fromEntries(
              Object.entries(metadata).map(([k, v]) => [
                k === oldKey ? newKey : k,
                v,
              ]),
            ),
          }
        : undefined,
      lastModified: new Date(),
    },
  };
}

# Context

## 1. Next.js Router Conflict → Resolution

**Problem:** `App Router and Pages Router both match path: /`

**Decision:** Use App Router (official recommendation)

**Action:** Deleted `pages/` directory

**Current State:** App Router serves `/` from `app/page.tsx`

---

## 2. Localization Type System

**Goal:** Merge multiple .arb files into unified structure

**Data Structure:**
```typescript
type LocalizationBundle = {
  [key: string]: {
    [locale: string]: string;
  };
};
```

**Key Files:**
- `lib/localization.ts` - Types, ARB parsing, bundle operations

**Core Types:**
```typescript
type LocalizationState = {
  bundle: LocalizationBundle;
  metadata: {
    sourceLocale: string;
    targetLocales: string[];
    entryMetadata?: Record<string, ArbMetadata>;
  };
};

type ArbFile = {
  '@@locale'?: string;
  '@@context'?: string;
  '@@last_modified'?: string;
  [key: string]: string | ArbMetadata | undefined;
};
```

**Key Functions:**
- `parseArbFile()` - Parse ARB JSON
- `mergeArbFiles()` - Combine multiple ARB files
- `bundleToArb()` - Export to ARB format
- `findMissingTranslations()` - Find incomplete keys
- `setTranslation()` / `addKey()` / `removeKey()` / `renameKey()` - Mutations

---

## 3. Skill: Caveman

Terse communication mode activated on request. Deactivated after server cleanup.

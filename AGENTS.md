# AGENTS.md

Instructions and context for AI agents working on this codebase.

## Project Overview

Samoan Faalupega Lookup Tool — a TypeScript CLI for searching traditional matai title records by village or title name. Built with Commander.js and Vitest.

## Quick Reference

| Task       | Command            |
| ---------- | ------------------ |
| Build      | `npm run build`    |
| Test       | `npm run test`     |
| Test watch | `npm run test:watch` |
| Run CLI    | `npm run start`    |

## Architecture

```
bin/faalupega.ts          CLI entry point (Commander.js)
src/commands/village.ts   Village lookup command (aliases: nuu, nu'u)
src/commands/matai.ts     Matai/title search command (alias: suafa)
src/search.ts             Search logic & Unicode normalization
src/format.ts             Terminal output formatting (text & JSON)
src/data/types.ts         TypeScript interfaces (Village, TitleEntry)
src/data/villages/*.ts    Village data files (one per village)
src/data/villages/index.ts  Village export index
src/data/index.ts         Top-level data export
tests/                    Vitest tests (data integrity, search, format)
```

## Data Model

Each village file exports a `Village` object:

```typescript
interface Village {
  name: string;              // Village name with diacritics (e.g., "Puipa'a")
  district: string;          // District name
  island: string;            // "Upolu" or "Savai'i"
  tulou: string[];           // Opening salutations (at least one required)
  saotamaitai: TitleEntry[]; // Female matai titles
  malaeFono: TitleEntry[];   // Meeting grounds / council areas
  maotaOAlii: TitleEntry[];  // Houses of chiefs
  igoaIpu: TitleEntry[];     // Kava cup names (Sāvali is always last)
}

interface TitleEntry {
  title: string;       // Matai title
  details: string[];   // Associated details (can be empty)
}
```

## Adding a New Village

1. Create `src/data/villages/<name>.ts` exporting a `Village` object
2. Re-export it from `src/data/villages/index.ts`
3. Add it to the `villages` array in `src/data/index.ts`
4. Run `npm run test` — data integrity tests validate the new entry automatically

## Samoan Text Conventions

- **Macrons** (ā, ē, ī, ō, ū) — preserve in all data; search normalization strips them
- **Glottal stops** (ʻ U+02BB) — preserve in data; stripped during search
- Searches are case-insensitive, diacritics-optional, and support partial matching
- The normalization pipeline: lowercase → NFD decompose → strip combining marks → strip glottal stops/apostrophes

## Coding Conventions

- ESM throughout (`"type": "module"` in package.json)
- TypeScript strict mode, target ES2022, Node16 module resolution
- Output goes to `dist/` (gitignored)
- CLI commands support `--json` flag for machine-readable output
- Bilingual aliases: English and Samoan names for each command

## Tests

Tests live in `tests/` and use Vitest. Three test files:

- **data.test.ts** — validates every village has required fields and no empty detail arrays
- **search.test.ts** — normalization, village search, matai search, compound title handling
- **format.test.ts** — terminal output formatting, section ordering, header layout

Always run `npm run test` before committing. All tests must pass.

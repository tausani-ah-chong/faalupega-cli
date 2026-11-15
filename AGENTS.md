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
bin/faalupega.ts                    CLI entry point (Commander.js)
src/commands/village.ts             Village lookup command (aliases: nuu, nu'u)
src/commands/matai.ts               Matai/title search command (alias: suafa)
src/commands/setup.ts               Interactive setup (choose the edition)
src/config.ts                       User config in ~/.faalupega/config.json
src/search.ts                       Search logic & Unicode normalization
src/format.ts                       Terminal output formatting (text & JSON)
src/mcp-server.ts                   MCP server exposing the same lookups
src/data/types.ts                   TypeScript interfaces (Village, TitleEntry)
src/data/districts.ts               The 11 official districts and the village ID type
src/data/villages/<edition>/*.ts    Village data files (one per village, per edition)
src/data/villages/<edition>/index.ts  Re-exports every village of that edition
src/data/villages/index.ts          Builds the allVillages array
src/data/index.ts                   Top-level data export (getVillages)
tests/                              Vitest tests (data, search, format, config, MCP)
```

## Data Model

Read `DATA_CONVENTIONS.md` before adding or editing data. It covers who may change what, village IDs, text rules and how to record remarks.

Each village file exports a `Village` object (see `src/data/types.ts` for the full comments):

```typescript
interface Village {
  id: VillageId;               // Global ID, e.g. "vaisigano/fagasa" (see DATA_CONVENTIONS.md, section 3)
  version: string;             // Edition identifier, e.g. "1930"
  name: string;                // Village name with diacritics (e.g., "Puipaʻa")
  district: string;            // District as the edition names it
  island: string;              // "Upolu" or "Savaiʻi"
  tulou: string[];             // Opening salutations (at least one required)
  saotamaitai: TitleEntry[];   // Female matai titles
  malaeFono: TitleEntry[];     // Meeting grounds / council areas
  maotaOAlii: TitleEntry[];    // Houses of chiefs
  maotaMaMalae?: TitleEntry[]; // Houses and meeting grounds
  maota?: TitleEntry[];        // Houses of chiefs without the "o Alii" qualifier
  igoaIpu: TitleEntry[];       // Kava cup names
  aualumaOTane?: string[];     // Names of the men's assembly
  ipuATamaitai?: TitleEntry[]; // Kava cups of female chiefs
  savali?: string;             // Village messenger
}

interface TitleEntry {
  title: string;       // Matai title, or a standalone name or remark
  details: string[];   // Associated details (empty array when the book gives none)
}
```

## Adding a New Village

1. Create `src/data/villages/<edition>/<name>.ts` exporting a `Village` object, with its `id` (`<district>/<village>`, district from `src/data/districts.ts`)
2. Re-export it from `src/data/villages/<edition>/index.ts`
3. Import it and add it to the `allVillages` array in `src/data/villages/index.ts`
4. Run `npm run test` — data integrity tests validate the new entry automatically

A village counts as verified only once its PR is merged to `main`.

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

Tests live in `tests/` and use Vitest. Five test files:

- **data.test.ts** — validates every village has required fields, a well-formed unique ID and non-empty titles
- **search.test.ts** — normalization, village search, matai search, compound title handling
- **format.test.ts** — terminal output formatting, section ordering, header layout
- **config.test.ts** — reading and writing the user config
- **mcp-server.test.ts** — MCP tool responses

Always run `npm run test` before committing. All tests must pass.

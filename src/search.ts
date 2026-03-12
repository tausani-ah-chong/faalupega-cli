import { getVillages } from "./data/index.js";
import type { Village, TitleEntry } from "./data/types.js";

/**
 * Normalize a Samoan string for comparison:
 * 1. Lowercase
 * 2. NFD decompose then strip combining diacritics (macrons)
 * 3. Remove glottal stop characters: ʻ (U+02BB), ' (U+2018), ' (U+2019), plain apostrophe
 */
export function normalize(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u02BB\u2018\u2019']/g, "");
}

/**
 * Find villages by name. Partial, case-insensitive match after normalization.
 */
export function findVillagesByName(query: string, version?: string): Village[] {
  const q = normalize(query);
  return getVillages(version).filter((v) => normalize(v.name).includes(q));
}

export interface SectionMatch {
  section: string;
  entries: TitleEntry[];
}

export interface MataiSearchResult {
  village: Village;
  matches: SectionMatch[];
}

/**
 * Standard section order used everywhere:
 * Tulou → Malae-Fono → Maota o Alii → O Igoa-Ipu a Alii → Sa'otama'ita'i
 */
const SECTION_CONFIG: { key: keyof Village; label: string }[] = [
  { key: "tulou", label: "TULOU" },
  { key: "malaeFono", label: "MALAE-FONO" },
  { key: "maotaOAlii", label: "MAOTA O ALII" },
  { key: "maotaMaMalae", label: "MAOTA MA MALAE" },
  { key: "igoaIpu", label: "O IGOA-IPU A ALII" },
  { key: "saotamaitai", label: "SAʻOTAMAʻITAʻI" },
  { key: "aualumaOTane", label: "AUALUMA O TANE" },
];

function matchesQuery(text: string, q: string): boolean {
  return normalize(text).includes(q);
}

function filterTitleEntries(entries: TitleEntry[], q: string): TitleEntry[] {
  return entries.filter((e) => {
    const titleNames = e.title.split(/,\s*/);
    const titleMatch = titleNames.some((name) => matchesQuery(name, q));
    const detailMatch = e.details.some((d) => matchesQuery(d, q));
    return titleMatch || detailMatch;
  });
}

/**
 * Search for a matai/suafa title across all village sections.
 * Returns focused results: only matching entries, grouped by section,
 * in standard section order.
 */
export function findMataiMatches(query: string, version?: string): MataiSearchResult[] {
  const q = normalize(query);
  const results: MataiSearchResult[] = [];

  for (const village of getVillages(version)) {
    const matches: SectionMatch[] = [];

    for (const { key, label } of SECTION_CONFIG) {
      const data = village[key];

      if (key === "tulou" || key === "aualumaOTane") {
        const stringData = (data as string[] | undefined) ?? [];
        const matching = stringData.filter((t) => matchesQuery(t, q));
        if (matching.length > 0) {
          matches.push({
            section: label,
            entries: matching.map((t) => ({ title: t, details: [] })),
          });
        }
      } else {
        const entries = (data as TitleEntry[] | undefined) ?? [];
        const filtered = filterTitleEntries(entries, q);
        if (filtered.length > 0) {
          matches.push({ section: label, entries: filtered });
        }
      }
    }

    if (matches.length > 0) {
      results.push({ village, matches });
    }
  }

  return results;
}

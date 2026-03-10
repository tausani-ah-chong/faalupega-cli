import { villages } from "./data/index.js";
import type { Village } from "./data/types.js";

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
 * e.g. "pui" matches "Puipa'a", "fale" matches "Faleata" (via district? no, name only)
 */
export function findVillagesByName(query: string): Village[] {
  const q = normalize(query);
  return villages.filter((v) => normalize(v.name).includes(q));
}

/**
 * Find villages by matai/suafa title. Partial, case-insensitive match.
 * Searches saotamaitai, maotaOAlii, and igoaIpu title fields.
 * Splits comma-separated compound titles so "Fanene" matches "Pepe, Fanene".
 */
export function findVillagesByMatai(query: string): Village[] {
  const q = normalize(query);
  return villages.filter((v) => {
    const allTitles = [
      ...v.saotamaitai.map((e) => e.title),
      ...v.maotaOAlii.map((e) => e.title),
      ...v.igoaIpu.map((e) => e.title),
    ];
    return allTitles.some((t) => {
      const names = t.split(/,\s*/);
      return names.some((name) => normalize(name).includes(q));
    });
  });
}

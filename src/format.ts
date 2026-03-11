import Table from "cli-table3";
import type { Village, TitleEntry } from "./data/types.js";
import type { MataiSearchResult } from "./search.js";

function formatDetails(entry: TitleEntry): string {
  if (entry.details.length === 0) return "";
  if (entry.details.length === 1) return entry.details[0];
  return entry.details.map((d, i) => `${i + 1}. ${d}`).join("\n");
}

function sectionTable(heading: string, entries: TitleEntry[]): string {
  const table = new Table({
    head: [heading, ""],
    style: { head: [], border: [] },
  });

  for (const entry of entries) {
    table.push([entry.title, formatDetails(entry)]);
  }

  return table.toString();
}

/**
 * Format a full village faalupega record as tables.
 * Section order: Tulou → Malae-Fono → Maota o Alii → O Igoa-Ipu a Alii → Sa'otama'ita'i
 */
export function formatVillage(village: Village): string {
  const parts: string[] = [
    `${village.name.toUpperCase()} — ${village.district}, ${village.island}`,
    "",
  ];

  // Tulou
  if (village.tulou.length > 0) {
    for (const t of village.tulou) {
      parts.push(t);
    }
    parts.push("");
  }

  // Malae-Fono
  if (village.malaeFono.length > 0) {
    parts.push(sectionTable("MALAE-FONO", village.malaeFono));
    parts.push("");
  }

  // Maota o Alii
  if (village.maotaOAlii.length > 0) {
    parts.push(sectionTable("MAOTA O ALII", village.maotaOAlii));
    parts.push("");
  }

  // O Igoa-Ipu a Alii
  if (village.igoaIpu.length > 0) {
    parts.push(sectionTable("O IGOA-IPU A ALII", village.igoaIpu));
    parts.push("");
  }

  // Sa'otama'ita'i
  if (village.saotamaitai.length > 0) {
    parts.push(sectionTable("SAʻOTAMAʻITAʻI", village.saotamaitai));
  }

  return parts.join("\n");
}

/**
 * Format focused matai search results as tables.
 * Shows village name, then only matching entries grouped by section.
 */
export function formatMataiResult(result: MataiSearchResult): string {
  const parts: string[] = [
    `${result.village.name} — ${result.village.district}, ${result.village.island}`,
  ];

  for (const match of result.matches) {
    if (match.section === "TULOU") {
      const table = new Table({
        head: ["TULOU"],
        style: { head: [], border: [] },
      });
      for (const entry of match.entries) {
        table.push([entry.title]);
      }
      parts.push(table.toString());
    } else {
      parts.push(sectionTable(match.section, match.entries));
    }
  }

  return parts.join("\n");
}

import type { Village, TitleEntry } from "./data/types.js";

function formatSection(heading: string, entries: TitleEntry[]): string {
  const lines: string[] = [`${heading}:`];
  for (const entry of entries) {
    if (entry.details.length === 1) {
      lines.push(`  ${entry.title} \u2014 ${entry.details[0]}`);
    } else {
      lines.push(`  ${entry.title}:`);
      entry.details.forEach((d, i) => {
        lines.push(`    ${i + 1}. ${d}`);
      });
    }
  }
  return lines.join("\n");
}

export function formatVillage(village: Village): string {
  const header = `${village.name.toUpperCase()} \u2014 ${village.district}, ${village.island}`;
  const bar = "\u2550".repeat(header.length + 4);

  const parts: string[] = [
    bar,
    `  ${header}`,
    bar,
    "",
  ];

  // Tulou
  for (const t of village.tulou) {
    parts.push(`  "${t}"`);
  }
  parts.push("");

  // Sections
  if (village.saotamaitai.length > 0) {
    parts.push(formatSection("SA\u02BBOTAMA\u02BBITA\u02BBI", village.saotamaitai));
    parts.push("");
  }

  if (village.malaeFono.length > 0) {
    parts.push(formatSection("MALAE-FONO", village.malaeFono));
    parts.push("");
  }

  if (village.maotaOAlii.length > 0) {
    parts.push(formatSection("MAOTA O ALII", village.maotaOAlii));
    parts.push("");
  }

  if (village.igoaIpu.length > 0) {
    parts.push(formatSection("O IGOA-IPU A ALII", village.igoaIpu));
    parts.push("");
  }

  if (village.savali.length > 0) {
    parts.push(`S\u0100VALI: ${village.savali.join(", ")}`);
  }

  return parts.join("\n");
}

export function formatVillageList(villages: Village[]): string {
  if (villages.length === 0) return "No villages found.";
  return villages
    .map((v) => `  ${v.name} \u2014 ${v.district}, ${v.island}`)
    .join("\n");
}

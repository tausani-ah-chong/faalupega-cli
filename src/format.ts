import type { Village, TitleEntry } from "./data/types.js";
import type { MataiSearchResult } from "./search.js";

/**
 * Print the "O LE TUSI FAALUPEGA O SAMOA" ASCII art banner in blue.
 */
export function printBanner(): void {
  const b = "\x1b[38;2;46;92;255m";
  const r = "\x1b[0m";
  const lines = [
    "",
    `   ___    _     _____   _____ _   _ ____ ___`,
    `  / _ \\  | |   | ____| |_   _| | | / ___|_ _|`,
    ` | | | | | |   |  _|     | | | | | \\___ \\| |`,
    ` | |_| | | |___| |___    | | | |_| |___) | |`,
    `  \\___/  |_____|_____|   |_|  \\___/|____/___|`,
    `  _____ _        _    _    _   _ ____  _____ ____    _`,
    ` |  ___/ \\      / \\  | |  | | | |  _ \\| ____/ ___|  / \\`,
    ` | |_ / _ \\    / _ \\ | |  | | | | |_) |  _|| |  _  / _ \\`,
    ` |  _/ ___ \\  / ___ \\| |__| |_| |  __/| |__| |_| |/ ___ \\`,
    ` |_|/_/   \\_\\/_/   \\_\\_____\\___/|_|   |_____\\____/_/   \\_\\`,
    `   ___    ____    _    __  __  ___    _`,
    `  / _ \\  / ___|  / \\  |  \\/  |/ _ \\  / \\`,
    ` | | | | \\___ \\ / _ \\ | |\\/| | | | |/ _ \\`,
    ` | |_| |  ___) / ___ \\| |  | | |_| / ___ \\`,
    `  \\___/  |____/_/   \\_\\_|  |_|\\___/_/   \\_\\`,
    "",
  ];
  for (const line of lines) {
    console.log(`  ${b}${line}${r}`);
  }
}

function formatSection(heading: string, entries: TitleEntry[]): string {
  const lines: string[] = [`${heading}:`];
  for (const entry of entries) {
    if (entry.details.length === 0) {
      lines.push(`  ${entry.title}`);
    } else if (entry.details.length === 1) {
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

/**
 * Format a standalone version box to print once at the top of output.
 */
export function formatVersionBox(version: string): string {
  const label = ` Version ${version} `;
  return [
    `\u250C${"\u2500".repeat(label.length)}\u2510`,
    `\u2502${label}\u2502`,
    `\u2514${"\u2500".repeat(label.length)}\u2518`,
  ].join("\n");
}

/**
 * Format a full village faalupega record.
 * Section order: Tulou → Malae-Fono → Maota o Alii → O Igoa-Ipu a Alii → Sa'otama'ita'i
 */
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
  if (village.tulou.length > 0) {
    for (const t of village.tulou) {
      parts.push(t);
    }
    parts.push("");
  }

  // Malae-Fono
  if (village.malaeFono.length > 0) {
    parts.push(formatSection("MALAE-FONO", village.malaeFono));
    parts.push("");
  }

  // Maota o Alii
  if (village.maotaOAlii.length > 0) {
    parts.push(formatSection("MAOTA O ALII", village.maotaOAlii));
    parts.push("");
  }

  // O Igoa-Ipu a Alii
  if (village.igoaIpu.length > 0) {
    parts.push(formatSection("O IGOA-IPU A ALII", village.igoaIpu));
    parts.push("");
  }

  // Sa'otama'ita'i
  if (village.saotamaitai.length > 0) {
    parts.push(formatSection("SA\u02BBOTAMA\u02BBITA\u02BBI", village.saotamaitai));
  }

  return parts.join("\n");
}

/**
 * Format focused matai search results.
 * Shows village name, then only matching entries grouped by section.
 * Section order: Tulou → Malae-Fono → Maota o Alii → O Igoa-Ipu a Alii → Sa'otama'ita'i
 */
export function formatMataiResult(result: MataiSearchResult): string {
  const header = `${result.village.name.toUpperCase()} \u2014 ${result.village.district}, ${result.village.island}`;
  const bar = "\u2550".repeat(header.length + 4);

  const parts: string[] = [
    bar,
    `  ${header}`,
    bar,
    "",
  ];

  for (const match of result.matches) {
    if (match.section === "TULOU") {
      parts.push(`  ${match.section}:`);
      for (const entry of match.entries) {
        parts.push(`    ${entry.title}`);
      }
    } else {
      parts.push(`  ${match.section}:`);
      for (const entry of match.entries) {
        if (entry.details.length === 0) {
          parts.push(`    ${entry.title}`);
        } else if (entry.details.length === 1) {
          parts.push(`    ${entry.title} \u2014 ${entry.details[0]}`);
        } else {
          parts.push(`    ${entry.title}:`);
          entry.details.forEach((d, i) => {
            parts.push(`      ${i + 1}. ${d}`);
          });
        }
      }
    }
  }

  return parts.join("\n");
}

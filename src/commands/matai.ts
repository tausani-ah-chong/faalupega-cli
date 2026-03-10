import { Command } from "commander";
import { findVillagesByMatai } from "../search.js";
import { formatVillage, formatVillageList } from "../format.js";

export const mataiCommand = new Command("matai")
  .description(
    "Search for a matai (chief) title and find which villages it belongs to.\n" +
    "Searches across Sa'otama'ita'i, Maota o Alii, and Igoa-Ipu sections.\n" +
    "Partial and case-insensitive. Diacritics optional.\n" +
    "Examples: faalupega matai Seiuli, faalupega matai Fanene, faalupega matai sei"
  )
  .argument("<name>", "Matai/suafa title to search for")
  .option("--json", "Output as JSON for programmatic use")
  .action((name: string, opts: { json?: boolean }) => {
    const results = findVillagesByMatai(name);
    if (results.length === 0) {
      console.error(`No villages found for matai title: ${name}`);
      process.exit(1);
    }
    if (opts.json) {
      console.log(JSON.stringify(results, null, 2));
    } else {
      console.log(`Found ${results.length} village(s) with title matching "${name}":\n`);
      results.forEach((v) => {
        console.log(formatVillage(v));
        console.log();
      });
    }
  });

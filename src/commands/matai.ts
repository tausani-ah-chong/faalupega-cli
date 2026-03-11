import { Command } from "commander";
import { findMataiMatches } from "../search.js";
import { formatMataiResult } from "../format.js";

export const mataiCommand = new Command("matai")
  .description(
    "Search for a matai (chief) title and find which villages it belongs to.\n" +
    "Searches across all sections: Tulou, Malae-Fono, Maota o Alii,\n" +
    "O Igoa-Ipu a Alii, and Sa\u02BBotama\u02BBita\u02BBi.\n" +
    "Partial and case-insensitive. Diacritics optional.\n" +
    "Examples: faalupega matai Seiuli, faalupega matai Fanene, faalupega matai ulu"
  )
  .argument("<name>", "Matai/suafa title to search for")
  .option("--json", "Output as JSON for programmatic use")
  .action((name: string, opts: { json?: boolean }) => {
    const results = findMataiMatches(name);
    if (results.length === 0) {
      console.error(`No villages found for matai title: ${name}`);
      process.exit(1);
    }
    if (opts.json) {
      const jsonResults = results.map((r) => ({
        village: { name: r.village.name, district: r.village.district, island: r.village.island },
        matches: r.matches,
      }));
      console.log(JSON.stringify(jsonResults, null, 2));
    } else {
      console.log(results.map((r) => formatMataiResult(r)).join("\n\n"));
    }
  });

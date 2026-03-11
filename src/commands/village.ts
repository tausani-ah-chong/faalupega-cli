import { Command } from "commander";
import { findVillagesByName } from "../search.js";
import { formatVillage } from "../format.js";

export const villageCommand = new Command("village")
  .description(
    "Look up a village's faalupega by name.\n" +
    "Searches are partial and case-insensitive. Diacritics (macrons, glottal stops) are optional.\n" +
    'Examples: faalupega village Puipaa, faalupega village "Puipaʻa", faalupega village pui'
  )
  .argument("<name>", "Village name to search for (diacritics optional)")
  .option("--json", "Output as JSON for programmatic use")
  .action((name: string, opts: { json?: boolean }) => {
    const results = findVillagesByName(name);
    if (results.length === 0) {
      console.error(`No faalupega found for village: ${name}`);
      process.exit(1);
    }
    if (opts.json) {
      console.log(JSON.stringify(results.length === 1 ? results[0] : results, null, 2));
    } else {
      if (results.length === 1) {
        console.log(formatVillage(results[0]));
      } else {
        console.log(`Found ${results.length} villages:\n`);
        results.forEach((v) => {
          console.log(formatVillage(v));
          console.log();
        });
      }
    }
  });

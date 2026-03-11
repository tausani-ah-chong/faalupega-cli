import { Command } from "commander";
import { findVillagesByName } from "../search.js";
import { formatVillage, formatVersionBox } from "../format.js";

export const villageCommand = new Command("village")
  .aliases(["nuu", "nu'u"])
  .description(
    "Look up a village's faalupega by name. (Samoan: nuu / nu'u)\n" +
    "Searches are partial and case-insensitive. Diacritics (macrons, glottal stops) are optional.\n" +
    'Examples: faalupega village Puipaa, faalupega nuu Puipaa, faalupega village pui'
  )
  .argument("<name>", "Village name to search for (diacritics optional)")
  .option("--json", "Output as JSON for programmatic use")
  .action((name: string, opts: { json?: boolean }, command: Command) => {
    const globalOpts = command.parent?.opts() as { dataVersion?: string };
    const version = globalOpts?.dataVersion;
    const results = findVillagesByName(name, version);
    if (results.length === 0) {
      console.error(`No faalupega found for village: ${name}`);
      process.exit(1);
    }
    if (opts.json) {
      console.log(JSON.stringify(results.length === 1 ? results[0] : results, null, 2));
    } else {
      console.log(formatVersionBox(version ?? "1930"));
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

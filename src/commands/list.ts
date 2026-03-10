import { Command } from "commander";
import { villages } from "../data/index.js";
import { formatVillageList } from "../format.js";

export const listCommand = new Command("list")
  .description("List all villages in the faalupega database")
  .option("--json", "Output as JSON for programmatic use")
  .action((opts: { json?: boolean }) => {
    if (opts.json) {
      const summary = villages.map((v) => ({
        name: v.name,
        district: v.district,
        island: v.island,
      }));
      console.log(JSON.stringify(summary, null, 2));
    } else {
      console.log("Villages in database:\n");
      console.log(formatVillageList(villages));
    }
  });

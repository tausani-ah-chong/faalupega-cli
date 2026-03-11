import { Command } from "commander";
import select from "@inquirer/select";
import {
  loadConfig,
  saveConfig,
  getAvailableVersions,
} from "../config.js";
import { printBanner } from "../format.js";

export const setupCommand = new Command("setup")
  .description(
    "Interactive setup for faalupega.\n" +
    "Displays a welcome banner and lets you choose the default version.\n" +
    "Your choice is saved to ~/.faalupega/config.json."
  )
  .action(async () => {
    printBanner();

    const config = loadConfig();
    const versions = getAvailableVersions();

    if (versions.length === 0) {
      console.error("No versions available.");
      process.exit(1);
    }

    const chosen = await select({
      message: "Select the default faalupega version:",
      choices: versions.map((v) => ({
        name: v,
        value: v,
        description: v === config.version ? "(current default)" : undefined,
      })),
      default: config.version ?? versions[0],
    });

    config.version = chosen;
    saveConfig(config);
    console.log(`\nDefault version set to: ${chosen}`);
  });

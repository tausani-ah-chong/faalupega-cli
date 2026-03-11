import { Command } from "commander";
import select from "@inquirer/select";
import {
  loadConfig,
  saveConfig,
  getAvailableVersions,
} from "../config.js";

export const setVersionCommand = new Command("set-version")
  .description(
    "Set the default faalupega version.\n" +
    "Opens an interactive picker to choose from available versions.\n" +
    "Your choice is saved to ~/.faalupega/config.json."
  )
  .action(async () => {
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

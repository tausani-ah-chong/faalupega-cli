#!/usr/bin/env node
import { Command } from "commander";
import { villageCommand } from "../src/commands/village.js";
import { mataiCommand } from "../src/commands/matai.js";

const program = new Command();

program
  .name("faalupega")
  .version("0.1.0")
  .helpOption("-h, --help", "Display help for command")
  .option("--data-version <version>", "Faalupega version year to query (e.g. 1930)", "1930")
  .description(
    `Samoan Faalupega Lookup Tool

Faalupega is the traditional record of matai (chief) titles for each
village in Samoa. It documents the sacred hierarchy of titles, their
connections, ceremonial meeting grounds (malae-fono), houses of chiefs
(maota o alii), and kava cup names (igoa-ipu a alii).

This tool provides a searchable reference for these records.
All searches are partial and case-insensitive. Samoan diacritics
(macrons: a, e, i, o, u and glottal stops: \u02BB) are optional in queries
but preserved in output.

Usage examples:
  $ faalupega village Puipaa          Search by village name
  $ faalupega nuu Puipaa             Same search using Samoan alias
  $ faalupega village pui             Partial match
  $ faalupega matai Seiuli            Search by matai title
  $ faalupega suafa Fanene            Same search using Samoan alias
  $ faalupega village Puipaa --json   JSON output for agents`
  );

program.addCommand(villageCommand);
program.addCommand(mataiCommand);

program.parse();

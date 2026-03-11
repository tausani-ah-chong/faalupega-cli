import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { villages } from "./data/index.js";

const CONFIG_DIR = join(homedir(), ".faalupega");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

export interface FaalupegaConfig {
  version?: string;
}

export function getConfigPath(): string {
  return CONFIG_FILE;
}

export function loadConfig(configPath: string = CONFIG_FILE): FaalupegaConfig {
  try {
    const raw = readFileSync(configPath, "utf-8");
    return JSON.parse(raw) as FaalupegaConfig;
  } catch {
    return {};
  }
}

export function saveConfig(
  config: FaalupegaConfig,
  configPath: string = CONFIG_FILE
): void {
  const dir =
    configPath === CONFIG_FILE
      ? CONFIG_DIR
      : configPath.substring(0, configPath.lastIndexOf("/"));
  mkdirSync(dir, { recursive: true });
  writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n", "utf-8");
}

export function getAvailableVersions(): string[] {
  const versions = new Set(villages.map((v) => v.version));
  return [...versions].sort();
}

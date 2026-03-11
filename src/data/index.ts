import { allVillages } from "./villages/index.js";
import type { Village } from "./types.js";

export const villages: Village[] = allVillages;

export function getVillages(version?: string): Village[] {
  if (!version) return villages;
  return villages.filter((v) => v.version === version);
}

export type { Village, TitleEntry } from "./types.js";
export { DEFAULT_VERSION } from "./types.js";

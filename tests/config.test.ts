import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { loadConfig, saveConfig, getAvailableVersions } from "../src/config.js";

describe("config", () => {
  let tempDir: string;
  let configPath: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "faalupega-test-"));
    configPath = join(tempDir, "config.json");
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it("loadConfig returns empty object when no file exists", () => {
    const config = loadConfig(configPath);
    expect(config).toEqual({});
  });

  it("saveConfig + loadConfig roundtrip", () => {
    saveConfig({ version: "1930" }, configPath);
    const config = loadConfig(configPath);
    expect(config.version).toBe("1930");
  });

  it("saveConfig overwrites existing config", () => {
    saveConfig({ version: "1930" }, configPath);
    saveConfig({ version: "2000" }, configPath);
    const config = loadConfig(configPath);
    expect(config.version).toBe("2000");
  });

  it("getAvailableVersions returns at least one version", () => {
    const versions = getAvailableVersions();
    expect(versions.length).toBeGreaterThan(0);
    expect(versions).toContain("1930");
  });

  it("getAvailableVersions returns sorted, unique values", () => {
    const versions = getAvailableVersions();
    const sorted = [...versions].sort();
    expect(versions).toEqual(sorted);
    expect(new Set(versions).size).toBe(versions.length);
  });
});

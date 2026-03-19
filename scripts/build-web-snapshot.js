#!/usr/bin/env node

/**
 * Generates a WebContainers FileSystemTree JSON snapshot from the compiled dist/ output.
 * This snapshot can be mounted directly into a WebContainer instance to run
 * faalupega-cli in the browser.
 *
 * Usage: node scripts/build-web-snapshot.js
 * Output: web-snapshot/fs-snapshot.json
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = join(__dirname, "..");
const DIST_DIR = join(ROOT, "dist");
const OUTPUT_DIR = join(ROOT, "web-snapshot");
const OUTPUT_FILE = join(OUTPUT_DIR, "fs-snapshot.json");

// Files to exclude from the snapshot (not needed in browser)
const EXCLUDE_PATTERNS = ["mcp-server"];

function shouldExclude(filePath) {
  return EXCLUDE_PATTERNS.some((pattern) => filePath.includes(pattern));
}

function buildDirectoryTree(dirPath, basePath) {
  const entries = readdirSync(dirPath);
  const tree = {};

  for (const entry of entries) {
    const fullPath = join(dirPath, entry);
    const relativePath = relative(basePath, fullPath);

    if (shouldExclude(relativePath)) {
      continue;
    }

    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      const subtree = buildDirectoryTree(fullPath, basePath);
      if (Object.keys(subtree).length > 0) {
        tree[entry] = { directory: subtree };
      }
    } else if (entry.endsWith(".js")) {
      // Only include .js files, skip .d.ts and other artifacts
      const contents = readFileSync(fullPath, "utf-8");
      tree[entry] = { file: { contents } };
    }
  }

  return tree;
}

function buildTrimmedPackageJson() {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf-8"));

  return JSON.stringify(
    {
      name: pkg.name,
      version: pkg.version,
      description: pkg.description,
      type: "module",
      bin: {
        faalupega: "./dist/bin/faalupega.js",
      },
      dependencies: {
        "@inquirer/select": pkg.dependencies["@inquirer/select"],
        commander: pkg.dependencies["commander"],
      },
    },
    null,
    2
  );
}

function main() {
  // Verify dist/ exists
  try {
    statSync(DIST_DIR);
  } catch {
    console.error("Error: dist/ directory not found. Run 'npm run build' first.");
    process.exit(1);
  }

  // Build the filesystem tree
  const distTree = buildDirectoryTree(DIST_DIR, DIST_DIR);

  const fsSnapshot = {
    "package.json": {
      file: { contents: buildTrimmedPackageJson() },
    },
    dist: {
      directory: distTree,
    },
  };

  // Write output
  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(OUTPUT_FILE, JSON.stringify(fsSnapshot, null, 2) + "\n", "utf-8");

  // Report stats
  const json = JSON.stringify(fsSnapshot);
  const fileCount = json.split('"file"').length - 1;
  const sizeKB = (Buffer.byteLength(json, "utf-8") / 1024).toFixed(1);
  console.log(`web-snapshot/fs-snapshot.json created (${fileCount} files, ${sizeKB} KB)`);
}

main();

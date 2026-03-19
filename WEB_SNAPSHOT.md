# Web Snapshot — Integration Guide

This document explains how to run faalupega-cli in the browser using WebContainers. It is written as step-by-step instructions that an AI agent or developer can follow exactly.

## What this does

The faalupega-cli is a Node.js CLI tool. It cannot run directly in a browser. WebContainers solve this by running a full Node.js environment inside the browser. The "web snapshot" is a single JSON file (`fs-snapshot.json`) that contains every file the CLI needs — compiled JavaScript and a trimmed `package.json`. You mount this JSON into a WebContainer, run `npm install`, then spawn the CLI process. The user sees the CLI output in a terminal widget (xterm.js) on your webpage.

## Overview of the architecture

```
┌─────────────────────────────────────────────┐
│  Browser                                    │
│                                             │
│  ┌──────────────┐    ┌───────────────────┐  │
│  │  xterm.js    │◄──►│  WebContainer     │  │
│  │  (terminal)  │    │                   │  │
│  │              │    │  fs-snapshot.json  │  │
│  │  user types  │───►│  mounted as files  │  │
│  │  sees output │◄───│                   │  │
│  └──────────────┘    │  node dist/bin/   │  │
│                      │  faalupega.js     │  │
│                      └───────────────────┘  │
└─────────────────────────────────────────────┘
```

- **xterm.js** renders a terminal in the browser and captures keyboard input.
- **WebContainer** runs Node.js in-browser. It has a virtual filesystem.
- **fs-snapshot.json** is mounted into that virtual filesystem so the CLI code is available.
- The CLI process runs inside the WebContainer and its stdout/stdin are piped to/from xterm.js.

## Step 1 — Generate the snapshot (in this repo)

Run this command in the faalupega-cli repo root:

```bash
npm run build:web-snapshot
```

This does two things:
1. Compiles TypeScript to `dist/` (runs `tsc`).
2. Runs `scripts/build-web-snapshot.js`, which reads every `.js` file in `dist/`, excludes `mcp-server.js` (not needed in browser), and writes `web-snapshot/fs-snapshot.json`.

The output file is `web-snapshot/fs-snapshot.json`. It is approximately 55 KB and contains ~30 files.

### What is inside fs-snapshot.json

The JSON follows the WebContainers FileSystemTree format. It looks like this:

```json
{
  "package.json": {
    "file": {
      "contents": "{ \"name\": \"faalupega\", \"version\": \"0.1.0\", ... }"
    }
  },
  "dist": {
    "directory": {
      "bin": {
        "directory": {
          "faalupega.js": {
            "file": { "contents": "..." }
          }
        }
      },
      "src": {
        "directory": {
          "commands": { "directory": { "...": "..." } },
          "data": { "directory": { "...": "..." } },
          "search.js": { "file": { "contents": "..." } },
          "format.js": { "file": { "contents": "..." } },
          "config.js": { "file": { "contents": "..." } }
        }
      }
    }
  }
}
```

Each file is represented as `{ "file": { "contents": "<source code>" } }`.
Each directory is represented as `{ "directory": { ... } }`.

The embedded `package.json` is trimmed to only include:
- `name`, `version`, `description`, `type` ("module")
- `bin.faalupega` pointing to `./dist/bin/faalupega.js`
- Two runtime dependencies: `commander` and `@inquirer/select`
- No devDependencies, no MCP dependency

## Step 2 — Copy the snapshot to your website project

Copy `web-snapshot/fs-snapshot.json` into your website project. Place it wherever your build system can import JSON files. For example:

```
your-website/
  src/
    fs-snapshot.json    <-- copy it here
    App.tsx
    ...
```

## Step 3 — Install required npm packages in your website project

Your website project needs these packages:

```bash
npm install @webcontainer/api @xterm/xterm @xterm/addon-fit
```

- `@webcontainer/api` — the WebContainers SDK
- `@xterm/xterm` — terminal emulator widget
- `@xterm/addon-fit` — auto-resizes xterm to fit its container

## Step 4 — Configure cross-origin isolation headers

WebContainers require these HTTP response headers on the page that loads them:

```
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```

How to set these depends on your framework:

- **Vite**: use the `vite-plugin-cross-origin-isolation` plugin, or add headers in `vite.config.ts`:
  ```ts
  server: {
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
    },
  }
  ```
- **Next.js**: add headers in `next.config.js` via the `headers()` function.
- **Static hosting (Netlify, Vercel)**: add headers in `_headers` or `vercel.json`.

Without these headers, `WebContainer.boot()` will throw an error.

## Step 5 — Write the integration code

Below is a complete, working example. Adapt it to your framework.

```ts
import { WebContainer } from "@webcontainer/api";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import fsSnapshot from "./fs-snapshot.json";

// You need a <div id="terminal"></div> in your HTML.

async function boot() {
  // --- xterm.js setup ---
  const terminalEl = document.getElementById("terminal");
  const terminal = new Terminal({ convertEol: true });
  const fitAddon = new FitAddon();
  terminal.loadAddon(fitAddon);
  terminal.open(terminalEl);
  fitAddon.fit();

  // --- WebContainer setup ---
  const wc = await WebContainer.boot();

  // Mount the filesystem snapshot.
  // This populates the WebContainer's virtual filesystem with package.json and dist/.
  await wc.mount(fsSnapshot);

  // Install dependencies (commander, @inquirer/select).
  // This runs `npm install` inside the WebContainer.
  terminal.writeln("Installing dependencies...");
  const install = await wc.spawn("npm", ["install"]);
  install.output.pipeTo(new WritableStream({
    write(chunk) { terminal.write(chunk); }
  }));
  const installExitCode = await install.exit;
  if (installExitCode !== 0) {
    terminal.writeln("npm install failed.");
    return;
  }

  // Run the CLI.
  // Change the arguments to run any faalupega command.
  // Examples:
  //   ["dist/bin/faalupega.js", "village", "Puipaa"]
  //   ["dist/bin/faalupega.js", "matai", "Seiuli"]
  //   ["dist/bin/faalupega.js", "village", "Puipaa", "--json"]
  //   ["dist/bin/faalupega.js", "setup"]  (interactive — needs input wiring below)
  const proc = await wc.spawn("node", ["dist/bin/faalupega.js", "village", "Puipaa"]);

  // Pipe CLI stdout to xterm.js.
  proc.output.pipeTo(new WritableStream({
    write(chunk) { terminal.write(chunk); }
  }));

  // Pipe xterm.js keyboard input to CLI stdin.
  // This is required for interactive commands like `faalupega setup`.
  terminal.onData((data) => {
    proc.input.getWriter().write(data);
  });

  await proc.exit;
}

boot();
```

### Key points about the code

1. `WebContainer.boot()` can only be called once per page. If you need to run multiple commands, reuse the same WebContainer instance.
2. `wc.mount(fsSnapshot)` is called once after boot. Do not call it again unless you need to update files.
3. `npm install` must complete before you spawn the CLI. It installs `commander` and `@inquirer/select` inside the WebContainer.
4. The CLI entry point is always `dist/bin/faalupega.js`. Pass arguments as an array to `wc.spawn`.
5. For read-only commands (like `village` or `matai` search), you only need to pipe `proc.output` to the terminal.
6. For interactive commands (like `setup`), you must also pipe terminal input to `proc.input`.

## Step 6 — Verify it works

1. Start your dev server.
2. Open the page with the terminal widget.
3. You should see "Installing dependencies..." followed by npm output, then the faalupega CLI output.
4. If you see a `SharedArrayBuffer` error, your cross-origin isolation headers are not configured (go back to Step 4).

## Available CLI commands to spawn

| Command | Arguments | Interactive? |
|---------|-----------|-------------|
| Search by village | `["dist/bin/faalupega.js", "village", "<name>"]` | No |
| Search by matai | `["dist/bin/faalupega.js", "matai", "<name>"]` | No |
| JSON output | `["dist/bin/faalupega.js", "village", "<name>", "--json"]` | No |
| Setup wizard | `["dist/bin/faalupega.js", "setup"]` | Yes (needs input piping) |
| Help | `["dist/bin/faalupega.js", "--help"]` | No |

All searches are partial and case-insensitive. Samoan diacritics (macrons and glottal stops) are optional in search input but preserved in output.

## Rebuilding after data changes

If village data or CLI code changes in the faalupega-cli repo, regenerate the snapshot:

```bash
npm run build:web-snapshot
```

Then copy the updated `web-snapshot/fs-snapshot.json` to your website project again.

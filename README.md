<img width="1992" height="1132" alt="Screenshot 2026-03-12 at 9 25 20 PM" src="https://github.com/user-attachments/assets/c3e09c45-65f3-4d9f-a56d-01c30114a20c" />

# Faalupega CLI - O LE TUSI FAALUPEGA O SAMOA

Samoan Faalupega Lookup Tool — a searchable CLI reference for traditional matai (chief) title records.

> **Research project — work in progress.** This tool is currently intended for research purposes only. The data is being individually cross-checked village by village and only 3 villages are available so far: **Puipa'a**, **Tafua**, and **Toamua** (all from the 1930 edition). More villages will be added as verification continues.

## What is Faalupega?

Faalupega is the traditional record of matai (chief) titles for each village in Samoa. It documents the sacred hierarchy of titles, their connections, ceremonial meeting grounds (malae-fono), houses of chiefs (maota o alii), and kava cup names (igoa-ipu a alii). These records are central to Samoan culture and governance.

## Installation

```bash
# Clone and build from source
git clone https://github.com/tausani-ah-chong/faalupega-cli.git
cd faalupega-cli
npm install
npm run build

node dist/bin/faalupega.js setup

node dist/bin/faalupega.js --help
```

Requires Node.js 18 or later.

## CLI Usage

### First-time setup

Run the interactive setup to choose a default faalupega version and see the welcome banner:

```bash
faalupega setup
```

This saves your preference to `~/.faalupega/config.json`.

### Search by village name

```bash
faalupega village Puipaa
faalupega nuu Puipaa        # "nuu" is a Samoan alias for "village"
faalupega village pui        # partial match works
```

### Search by matai title

```bash
faalupega matai Seiuli
faalupega suafa Fanene       # "suafa" is a Samoan alias for "matai"
faalupega matai ulu          # partial match works
```

### Options

| Flag | Description |
|------|-------------|
| `--json` | Output results as JSON (useful for scripts and AI agents) |
| `--data-version <year>` | Query a specific faalupega edition (e.g. `1930`) |
| `-h, --help` | Display help for any command |
| `-V, --version` | Show the CLI version |

```bash
# JSON output
faalupega village Puipaa --json

# Specify a data version
faalupega --data-version 1930 village Tafua

# Help
faalupega --help
faalupega village --help
faalupega matai --help
```

### Search behaviour

- All searches are **partial** and **case-insensitive**
- Samoan diacritics (macrons: ā, ē, ī, ō, ū and glottal stops: ʻ) are **optional** in queries but **preserved** in output
- Searching `pui` will match `Puipaʻa`, searching `sei` will match `Seiuli`, etc.

## Available Data

Currently only the **1930** edition is included, with 3 villages verified so far:

| Village | District | Island |
|---------|----------|--------|
| Puipaʻa | Faleata | Upolu |
| Tafua | Faʻasaleleaga | Savaiʻi |
| Toamua | Faleata | Upolu |

Each village record includes (where applicable):
- **Tulou** — the ceremonial address/salutation
- **Malae-Fono** — the meeting ground(s)
- **Maota o Alii** — the houses of chiefs
- **O Igoa-Ipu a Alii** — the kava cup names of chiefs
- **Saʻotamaʻitaʻi** — the female line of titles

## MCP Server

The faalupega CLI includes an MCP (Model Context Protocol) server, allowing AI agents and MCP-compatible clients to search faalupega data programmatically.

### Tools

| Tool | Description |
|------|-------------|
| `search_village` | Search villages by name and return their complete faalupega records |
| `search_matai` | Search for a matai title across all villages and return matching entries |

Both tools support partial, case-insensitive queries. Samoan diacritics are optional in searches but preserved in results. Both tools accept an optional `version` parameter (e.g. `"1930"`) to query a specific faalupega edition.

### Running the MCP Server

```bash
# Via npm script
npm run mcp

# Or directly
node dist/src/mcp-server.js

# Or if installed globally
faalupega-mcp
```

### Claude Desktop Configuration

Add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "faalupega": {
      "command": "node",
      "args": ["/path/to/faalupega-cli/dist/src/mcp-server.js"]
    }
  }
}
```

Or if installed globally via `npm install -g faalupega`:

```json
{
  "mcpServers": {
    "faalupega": {
      "command": "faalupega-mcp"
    }
  }
}
```

### Example Tool Usage

**search_village** — search for a village by name:
```json
{ "name": "Puipaa" }
```
Returns the full village faalupega record (tulou, malae-fono, maota o alii, igoa-ipu, sa'otama'ita'i).

**search_matai** — search for a matai title:
```json
{ "name": "Seiuli" }
```
Returns matching villages with only the relevant sections and entries that matched.

## License

MIT

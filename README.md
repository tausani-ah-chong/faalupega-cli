<img width="1992" height="1132" alt="Screenshot 2026-03-12 at 9 25 20 PM" src="https://github.com/user-attachments/assets/c3e09c45-65f3-4d9f-a56d-01c30114a20c" />

# faalupega-cli

Samoan Faalupega Lookup Tool — a searchable reference for traditional matai title records.

## MCP Server

The faalupega CLI includes an MCP (Model Context Protocol) server, allowing AI agents and MCP-compatible clients to search faalupega data programmatically.

### Tools

| Tool | Description |
|------|-------------|
| `search_village` | Search villages by name and return their complete faalupega records |
| `search_matai` | Search for a matai title across all villages and return matching entries |

Both tools support partial, case-insensitive queries. Samoan diacritics (macrons and glottal stops) are optional in searches but preserved in results.

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

Both tools accept an optional `version` parameter (e.g. `"1930"`) to query a specific faalupega edition.

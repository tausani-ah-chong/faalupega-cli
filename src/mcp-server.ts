#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { findVillagesByName, findMataiMatches } from "./search.js";
import { loadConfig } from "./config.js";

export function createServer(): McpServer {
  const config = loadConfig();
  const defaultVersion = config.version ?? "1930";

  const server = new McpServer({
    name: "faalupega",
    version: "0.1.0",
  });

  server.tool(
    "search_village",
    "Search Samoan villages by name and return their faalupega (traditional matai title records). " +
      "Searches are partial and case-insensitive. Samoan diacritics (macrons and glottal stops) are optional " +
      "in the query but preserved in results.",
    {
      name: z.string().describe("Village name to search for (partial match, diacritics optional)"),
      version: z
        .string()
        .optional()
        .describe("Data version year to query (e.g. '1930'). Defaults to configured version."),
    },
    async ({ name, version }) => {
      const results = findVillagesByName(name, version ?? defaultVersion);
      if (results.length === 0) {
        return {
          content: [{ type: "text", text: `No faalupega found for village: ${name}` }],
        };
      }
      const data = results.length === 1 ? results[0] : results;
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    }
  );

  server.tool(
    "search_matai",
    "Search for a matai (chief) title across all Samoan villages and return matching faalupega records. " +
      "Searches all sections: tulou, malae-fono, maota o alii, igoa-ipu, and sa'otama'ita'i. " +
      "Partial and case-insensitive. Diacritics optional in queries.",
    {
      name: z.string().describe("Matai/suafa title to search for (partial match, diacritics optional)"),
      version: z
        .string()
        .optional()
        .describe("Data version year to query (e.g. '1930'). Defaults to configured version."),
    },
    async ({ name, version }) => {
      const results = findMataiMatches(name, version ?? defaultVersion);
      if (results.length === 0) {
        return {
          content: [{ type: "text", text: `No villages found for matai title: ${name}` }],
        };
      }
      const jsonResults = results.map((r) => ({
        village: {
          name: r.village.name,
          district: r.village.district,
          island: r.village.island,
          version: r.village.version,
        },
        matches: r.matches,
      }));
      return {
        content: [{ type: "text", text: JSON.stringify(jsonResults, null, 2) }],
      };
    }
  );

  return server;
}

// Run stdio transport when executed directly
const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

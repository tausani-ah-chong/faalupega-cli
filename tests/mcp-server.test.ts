import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../src/mcp-server.js";

describe("MCP Server", () => {
  let client: Client;
  let cleanup: () => Promise<void>;

  beforeAll(async () => {
    const server = createServer();
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);

    client = new Client({ name: "test-client", version: "1.0.0" });
    await client.connect(clientTransport);

    cleanup = async () => {
      await client.close();
      await server.close();
    };
  });

  afterAll(async () => {
    await cleanup();
  });

  it("lists exactly 2 tools", async () => {
    const { tools } = await client.listTools();
    expect(tools).toHaveLength(2);
    const names = tools.map((t) => t.name).sort();
    expect(names).toEqual(["search_matai", "search_village"]);
  });

  describe("search_village", () => {
    it("returns results for known village", async () => {
      const result = await client.callTool({ name: "search_village", arguments: { name: "Puipaa" } });
      const text = (result.content as Array<{ type: string; text: string }>)[0].text;
      const data = JSON.parse(text);
      // Single result returns object directly (not array), matching CLI --json behavior
      expect(data.name).toBe("Puipaʻa");
      expect(data.district).toBe("Faleata");
      expect(data.island).toBe("Upolu");
    });

    it("returns no-results message for nonexistent village", async () => {
      const result = await client.callTool({ name: "search_village", arguments: { name: "nonexistent" } });
      const text = (result.content as Array<{ type: string; text: string }>)[0].text;
      expect(text).toBe("No faalupega found for village: nonexistent");
    });

    it("returns empty for non-existent version", async () => {
      const result = await client.callTool({ name: "search_village", arguments: { name: "Puipaa", version: "9999" } });
      const text = (result.content as Array<{ type: string; text: string }>)[0].text;
      expect(text).toContain("No faalupega found");
    });
  });

  describe("search_matai", () => {
    it("returns results for known matai title", async () => {
      const result = await client.callTool({ name: "search_matai", arguments: { name: "Seiuli" } });
      const text = (result.content as Array<{ type: string; text: string }>)[0].text;
      const data = JSON.parse(text);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      // Matches CLI --json shape: village summary + matches
      expect(data[0].village.name).toBe("Puipaʻa");
      expect(data[0].village.district).toBeDefined();
      expect(data[0].village.island).toBeDefined();
      expect(data[0].village.version).toBeDefined();
      expect(data[0].matches.length).toBeGreaterThan(0);
      // Should NOT include full village data (tulou, malaeFono, etc.)
      expect(data[0].village.tulou).toBeUndefined();
    });

    it("returns no-results message for nonexistent matai", async () => {
      const result = await client.callTool({ name: "search_matai", arguments: { name: "nonexistent" } });
      const text = (result.content as Array<{ type: string; text: string }>)[0].text;
      expect(text).toBe("No villages found for matai title: nonexistent");
    });
  });
});

import { describe, it, expect } from "vitest";
import { normalize, findVillagesByName, findMataiMatches } from "../src/search.js";

describe("normalize", () => {
  it("lowercases input", () => {
    expect(normalize("PUIPA")).toBe("puipa");
  });

  it("strips macrons", () => {
    expect(normalize("Faumuinā")).toBe("faumuina");
    expect(normalize("Tolotūpō")).toBe("tolotupo");
  });

  it("strips glottal stops (ʻ U+02BB)", () => {
    expect(normalize("Puipaʻa")).toBe("puipaa");
    expect(normalize("Mataiʻa")).toBe("mataia");
  });

  it("strips curly apostrophes", () => {
    expect(normalize("Puipa\u2018a")).toBe("puipaa");
    expect(normalize("Puipa\u2019a")).toBe("puipaa");
  });

  it("strips plain apostrophes", () => {
    expect(normalize("Puipa'a")).toBe("puipaa");
  });

  it("handles plain ASCII unchanged", () => {
    expect(normalize("seiuli")).toBe("seiuli");
  });

  it("handles mixed diacritics and case", () => {
    expect(normalize("FAUMUINĀ")).toBe("faumuina");
  });
});

describe("findVillagesByName", () => {
  it("finds village by exact name (normalized)", () => {
    const results = findVillagesByName("Puipaa");
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("Puipaʻa");
  });

  it("finds village by partial name", () => {
    const results = findVillagesByName("pui");
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("Puipaʻa");
  });

  it("is case insensitive", () => {
    const results = findVillagesByName("PUIPAA");
    expect(results).toHaveLength(1);
  });

  it("matches with glottal stop in query", () => {
    const results = findVillagesByName("Puipa\u02BBa");
    expect(results).toHaveLength(1);
  });

  it("returns empty array for no match", () => {
    const results = findVillagesByName("nonexistent");
    expect(results).toHaveLength(0);
  });

  it("filters by version when provided", () => {
    const results = findVillagesByName("Puipaa", "1930");
    expect(results).toHaveLength(1);
    expect(results[0].version).toBe("1930");
  });

  it("returns empty for non-existent version", () => {
    const results = findVillagesByName("Puipaa", "9999");
    expect(results).toHaveLength(0);
  });
});

describe("findMataiMatches", () => {
  it("finds village by matai title", () => {
    const results = findMataiMatches("Seiuli");
    expect(results).toHaveLength(1);
    expect(results[0].village.name).toBe("Puipaʻa");
    expect(results[0].matches.length).toBeGreaterThan(0);
  });

  it("returns matches grouped by section", () => {
    const results = findMataiMatches("Seiuli");
    const sections = results[0].matches.map((m) => m.section);
    expect(sections).toContain("MAOTA O ALII");
    expect(sections).toContain("O IGOA-IPU A ALII");
    expect(sections).toContain("SAʻOTAMAʻITAʻI");
  });

  it("orders matches in standard section order", () => {
    const results = findMataiMatches("Seiuli");
    const sections = results[0].matches.map((m) => m.section);
    const order = ["TULOU", "MALAE-FONO", "MAOTA O ALII", "O IGOA-IPU A ALII", "SAʻOTAMAʻITAʻI"];
    const indices = sections.map((s) => order.indexOf(s));
    for (let i = 1; i < indices.length; i++) {
      expect(indices[i]).toBeGreaterThan(indices[i - 1]);
    }
  });

  it("finds compound title member (Fanene from 'Pepe, Fanene')", () => {
    const results = findMataiMatches("Fanene");
    expect(results).toHaveLength(1);
  });

  it("searches tulou text", () => {
    const results = findMataiMatches("Seiulialii");
    expect(results).toHaveLength(1);
    const tulou = results[0].matches.find((m) => m.section === "TULOU");
    expect(tulou).toBeDefined();
  });

  it("searches detail text", () => {
    const results = findMataiMatches("Ulugia");
    expect(results).toHaveLength(1);
    const ipu = results[0].matches.find((m) => m.section === "O IGOA-IPU A ALII");
    expect(ipu).toBeDefined();
    expect(ipu!.entries.some((e) => e.title === "Sāvali")).toBe(true);
  });

  it("partial match across multiple sections", () => {
    const results = findMataiMatches("ulu");
    expect(results).toHaveLength(1);
    const sections = results[0].matches.map((m) => m.section);
    expect(sections).toContain("TULOU");
    expect(sections).toContain("SAʻOTAMAʻITAʻI");
  });

  it("is case insensitive", () => {
    const results = findMataiMatches("seiuli");
    expect(results).toHaveLength(1);
  });

  it("returns empty array for no match", () => {
    const results = findMataiMatches("nonexistent");
    expect(results).toHaveLength(0);
  });

  it("filters by version when provided", () => {
    const results = findMataiMatches("Seiuli", "1930");
    expect(results).toHaveLength(1);
    expect(results[0].village.version).toBe("1930");
  });

  it("returns empty for non-existent version", () => {
    const results = findMataiMatches("Seiuli", "9999");
    expect(results).toHaveLength(0);
  });
});

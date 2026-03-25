import { describe, it, expect, vi } from "vitest";
import { normalize } from "../src/search.js";
import type { Village } from "../src/data/types.js";

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

// --- Mock village data for unit tests ---

vi.mock("../src/data/index.js", () => {
  const mockVillages: Village[] = [
    {
      version: "1930",
      name: "Testville",
      district: "TestDistrict",
      island: "Upolu",
      tulou: ["Tulouna lau tofa Seiulialii"],
      malaeFono: [{ title: "Lepea", details: ["Fono o le manino"] }],
      maotaOAlii: [
        { title: "Seiuli", details: ["Vaiusu"] },
        { title: "Pepe, Fanene", details: ["Samusu"] },
      ],
      igoaIpu: [
        { title: "Seiuli", details: ["Fai ʻava le ita"] },
        { title: "Sāvali", details: ["Ulugia ma Faleʻafa"] },
      ],
      saotamaitai: [{ title: "Seiuli", details: ["Letelesā"] }],
    },
    {
      version: "1930",
      name: "Othertown",
      district: "OtherDistrict",
      island: "Savaiʻi",
      tulou: ["Tulouna le paia"],
      malaeFono: [{ title: "Maluā", details: ["Fono a le faigāmālō"] }],
      maotaOAlii: [{ title: "Tupa", details: ["Lealatele"] }],
      igoaIpu: [
        { title: "Tupa", details: ["Ita eseese"] },
        { title: "Sāvali", details: ["Ulugia"] },
      ],
      saotamaitai: [{ title: "Faumuinā", details: ["Letelesā"] }],
    },
    {
      version: "2000",
      name: "Futureplace",
      district: "FutureDistrict",
      island: "Upolu",
      tulou: ["Tulouna"],
      malaeFono: [{ title: "Malae", details: ["Fono"] }],
      maotaOAlii: [{ title: "Ali", details: ["House"] }],
      igoaIpu: [{ title: "Sāvali", details: ["Runner"] }],
      saotamaitai: [{ title: "Tama", details: ["Detail"] }],
    },
  ];

  return {
    villages: mockVillages,
    getVillages: (version?: string) => {
      if (!version) return mockVillages;
      return mockVillages.filter((v) => v.version === version);
    },
  };
});

// Import AFTER mock setup (vi.mock is hoisted, but this makes intent clear)
const { findVillagesByName, findMataiMatches } = await import("../src/search.js");

describe("findVillagesByName (unit)", () => {
  it("finds village by exact name (normalized)", () => {
    const results = findVillagesByName("Testville");
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("Testville");
  });

  it("finds village by partial name", () => {
    const results = findVillagesByName("test");
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("Testville");
  });

  it("is case insensitive", () => {
    const results = findVillagesByName("TESTVILLE");
    expect(results).toHaveLength(1);
  });

  it("returns empty array for no match", () => {
    const results = findVillagesByName("nonexistent");
    expect(results).toHaveLength(0);
  });

  it("filters by version when provided", () => {
    const results = findVillagesByName("Testville", "1930");
    expect(results).toHaveLength(1);
    expect(results[0].version).toBe("1930");
  });

  it("returns empty for non-existent version", () => {
    const results = findVillagesByName("Testville", "9999");
    expect(results).toHaveLength(0);
  });
});

describe("findMataiMatches (unit)", () => {
  it("finds village by matai title", () => {
    const results = findMataiMatches("Seiuli");
    expect(results).toHaveLength(1);
    expect(results[0].village.name).toBe("Testville");
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
    expect(results).toHaveLength(2);
    const testville = results.find((r) => r.village.name === "Testville");
    const ipu = testville!.matches.find((m) => m.section === "O IGOA-IPU A ALII");
    expect(ipu).toBeDefined();
    expect(ipu!.entries.some((e) => e.title === "Sāvali")).toBe(true);
  });

  it("partial match across multiple sections", () => {
    const results = findMataiMatches("Seiuli");
    const testville = results.find((r) => r.village.name === "Testville");
    expect(testville).toBeDefined();
    const sections = testville!.matches.map((m) => m.section);
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
    results.forEach((r) => expect(r.village.version).toBe("1930"));
  });

  it("returns empty for non-existent version", () => {
    const results = findMataiMatches("Seiuli", "9999");
    expect(results).toHaveLength(0);
  });
});

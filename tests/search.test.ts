import { describe, it, expect } from "vitest";
import { normalize, findVillagesByName, findVillagesByMatai } from "../src/search.js";

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
});

describe("findVillagesByMatai", () => {
  it("finds village by exact matai title", () => {
    const results = findVillagesByMatai("Seiuli");
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("Puipaʻa");
  });

  it("finds village by partial matai title", () => {
    const results = findVillagesByMatai("sei");
    expect(results).toHaveLength(1);
  });

  it("finds village by compound title member (Fanene from 'Pepe, Fanene')", () => {
    const results = findVillagesByMatai("Fanene");
    expect(results).toHaveLength(1);
  });

  it("finds village by matai with macron", () => {
    const results = findVillagesByMatai("Faumuina");
    expect(results).toHaveLength(1);
  });

  it("finds village by matai with glottal stop stripped", () => {
    const results = findVillagesByMatai("Mataia");
    expect(results).toHaveLength(1);
  });

  it("is case insensitive", () => {
    const results = findVillagesByMatai("seiuli");
    expect(results).toHaveLength(1);
  });

  it("returns empty array for no match", () => {
    const results = findVillagesByMatai("nonexistent");
    expect(results).toHaveLength(0);
  });
});

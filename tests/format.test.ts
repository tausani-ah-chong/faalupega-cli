import { describe, it, expect } from "vitest";
import { formatVillage, formatMataiResult } from "../src/format.js";
import { findMataiMatches } from "../src/search.js";
import { puipaa } from "../src/data/villages/1930/puipaa.js";

describe("formatVillage", () => {
  const output = formatVillage(puipaa);

  it("shows version as first line", () => {
    const firstLine = output.split("\n")[0];
    expect(firstLine).toBe("Version: 1930");
  });

  it("includes village name in header", () => {
    expect(output).toContain("PUIPAʻA");
  });

  it("includes district and island", () => {
    expect(output).toContain("Faleata, Upolu");
  });

  it("includes the tulou salutation", () => {
    expect(output).toContain("Tulouna lau tofa");
  });

  it("includes MALAE-FONO section", () => {
    expect(output).toContain("MALAE-FONO:");
    expect(output).toContain("Lepea \u2014 Fono o le manino (filemu)");
  });

  it("includes MAOTA O ALII section", () => {
    expect(output).toContain("MAOTA O ALII:");
  });

  it("includes IGOA-IPU section with numbered multi-detail entries", () => {
    expect(output).toContain("O IGOA-IPU A ALII:");
    expect(output).toContain("1. Fai ʻava le ita");
    expect(output).toContain("2. Talitigā");
    expect(output).toContain("3. Numia ma Tumua");
  });

  it("includes Sāvali as igoaIpu entry", () => {
    expect(output).toContain("Sāvali \u2014 Ulugia ma Faleʻafa");
  });

  it("includes SAʻOTAMAʻITAʻI section", () => {
    expect(output).toContain("SAʻOTAMAʻITAʻI:");
    expect(output).toContain("Faumuinā \u2014 Letelesā");
  });

  it("follows standard section order: Tulou → Malae-Fono → Maota → Igoa-Ipu → Saotamaitai", () => {
    const tulouPos = output.indexOf("Tulouna lau tofa");
    const malaePos = output.indexOf("MALAE-FONO:");
    const maotaPos = output.indexOf("MAOTA O ALII:");
    const ipuPos = output.indexOf("O IGOA-IPU A ALII:");
    const saotaPos = output.indexOf("SAʻOTAMAʻITAʻI:");
    expect(tulouPos).toBeLessThan(malaePos);
    expect(malaePos).toBeLessThan(maotaPos);
    expect(maotaPos).toBeLessThan(ipuPos);
    expect(ipuPos).toBeLessThan(saotaPos);
  });
});

describe("formatMataiResult", () => {
  it("shows village name header", () => {
    const results = findMataiMatches("Seiuli");
    const output = formatMataiResult(results[0]);
    expect(output).toContain("PUIPAʻA \u2014 Faleata, Upolu");
  });

  it("shows only matching entries, not full record", () => {
    const results = findMataiMatches("Seiuli");
    const output = formatMataiResult(results[0]);
    expect(output).toContain("Seiuli");
    // Should NOT contain unrelated entries
    expect(output).not.toContain("Lepea");
    expect(output).not.toContain("Vaitagutu");
  });

  it("shows matching tulou when applicable", () => {
    const results = findMataiMatches("ulu");
    const output = formatMataiResult(results[0]);
    expect(output).toContain("TULOU:");
    expect(output).toContain("Tulouna lau tofa");
  });

  it("formats single-detail entries with em-dash", () => {
    const results = findMataiMatches("Seiuli");
    const output = formatMataiResult(results[0]);
    expect(output).toContain("Seiuli \u2014 Vaiusu");
  });

  it("follows standard section order in matches", () => {
    const results = findMataiMatches("ulu");
    const output = formatMataiResult(results[0]);
    const tulouPos = output.indexOf("TULOU:");
    const saotaPos = output.indexOf("SAʻOTAMAʻITAʻI:");
    expect(tulouPos).toBeLessThan(saotaPos);
  });
});

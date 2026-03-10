import { describe, it, expect } from "vitest";
import { formatVillage, formatVillageList } from "../src/format.js";
import { puipaa } from "../src/data/villages/puipaa.js";

describe("formatVillage", () => {
  const output = formatVillage(puipaa);

  it("includes village name in header", () => {
    expect(output).toContain("PUIPA\u02BBA");
  });

  it("includes district and island", () => {
    expect(output).toContain("Faleata, Upolu");
  });

  it("includes the tulou salutation", () => {
    expect(output).toContain("Tulouna lau tofa");
  });

  it("includes SA\u02BBOTAMA\u02BBITA\u02BBI section", () => {
    expect(output).toContain("SA\u02BBOTAMA\u02BBITA\u02BBI:");
    expect(output).toContain("Faumuin\u0101 \u2014 Leteles\u0101");
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
    // Faumuinā has 3 cup names — should be numbered
    expect(output).toContain("1. Fai \u02BBava le ita");
    expect(output).toContain("2. Talitig\u0101");
    expect(output).toContain("3. Numia ma Tumua");
  });

  it("includes S\u0100VALI section", () => {
    expect(output).toContain("S\u0100VALI: Ulugia, Fale\u02BBafa");
  });
});

describe("formatVillageList", () => {
  it("formats village summary", () => {
    const output = formatVillageList([puipaa]);
    expect(output).toContain("Puipa\u02BBa");
    expect(output).toContain("Faleata, Upolu");
  });

  it("returns message for empty list", () => {
    expect(formatVillageList([])).toBe("No villages found.");
  });
});

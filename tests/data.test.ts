import { describe, it, expect } from "vitest";
import { villages } from "../src/data/index.js";

describe("data integrity", () => {
  it("has at least one village", () => {
    expect(villages.length).toBeGreaterThan(0);
  });

  for (const village of villages) {
    describe(`village: ${village.name}`, () => {
      it("has a version", () => {
        expect(village.version.trim().length).toBeGreaterThan(0);
      });

      it("has a non-empty name", () => {
        expect(village.name.trim().length).toBeGreaterThan(0);
      });

      it("has a district", () => {
        expect(village.district.trim().length).toBeGreaterThan(0);
      });

      it("has an island", () => {
        expect(village.island.trim().length).toBeGreaterThan(0);
      });

      it("has at least one tulou salutation", () => {
        expect(village.tulou.length).toBeGreaterThan(0);
        village.tulou.forEach((t) => {
          expect(t.trim().length).toBeGreaterThan(0);
        });
      });

      it("has no empty details arrays in saotamaitai (except remarks)", () => {
        village.saotamaitai.forEach((entry) => {
          expect(entry.title.trim().length).toBeGreaterThan(0);
          // Remark entries like "E aofia ia..." have no details — that's valid
          if (!entry.title.startsWith("E ")) {
            expect(entry.details.length).toBeGreaterThan(0);
          }
        });
      });

      it("has non-empty titles in malaeFono", () => {
        village.malaeFono.forEach((entry) => {
          expect(entry.title.trim().length).toBeGreaterThan(0);
        });
      });

      it("has no empty details arrays in maotaOAlii", () => {
        village.maotaOAlii.forEach((entry) => {
          expect(entry.details.length).toBeGreaterThan(0);
        });
      });

      it("has no empty details arrays in igoaIpu (except remarks)", () => {
        village.igoaIpu.forEach((entry) => {
          expect(entry.title.trim().length).toBeGreaterThan(0);
          // Remark entries like "E tapa fua..." or "O isi e tapa fua" have no details
          if (!entry.title.startsWith("E ") && !entry.title.startsWith("O isi")) {
            expect(entry.details.length).toBeGreaterThan(0);
          }
        });
      });
    });
  }
});

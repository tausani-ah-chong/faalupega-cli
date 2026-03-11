import { describe, it, expect } from "vitest";
import { villages } from "../src/data/index.js";

describe("data integrity", () => {
  it("has at least one village", () => {
    expect(villages.length).toBeGreaterThan(0);
  });

  for (const village of villages) {
    describe(`village: ${village.name}`, () => {
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

      it("has no empty details arrays in saotamaitai", () => {
        village.saotamaitai.forEach((entry) => {
          expect(entry.details.length).toBeGreaterThan(0);
          expect(entry.title.trim().length).toBeGreaterThan(0);
        });
      });

      it("has no empty details arrays in malaeFono", () => {
        village.malaeFono.forEach((entry) => {
          expect(entry.details.length).toBeGreaterThan(0);
        });
      });

      it("has no empty details arrays in maotaOAlii", () => {
        village.maotaOAlii.forEach((entry) => {
          expect(entry.details.length).toBeGreaterThan(0);
        });
      });

      it("has no empty details arrays in igoaIpu", () => {
        village.igoaIpu.forEach((entry) => {
          expect(entry.details.length).toBeGreaterThan(0);
        });
      });
    });
  }
});

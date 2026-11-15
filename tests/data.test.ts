import { describe, it, expect } from "vitest";
import { villages, DISTRICT_IDS, VILLAGE_ID_PATTERN } from "../src/data/index.js";

describe("data integrity", () => {
  it("has at least one village", () => {
    expect(villages.length).toBeGreaterThan(0);
  });

  it("gives each village one ID per edition", () => {
    // A record is an ID plus a version, so the pair must be unique.
    const keys = villages.map((v) => `${v.version}:${v.id}`);
    const duplicates = keys.filter((key, i) => keys.indexOf(key) !== i);
    expect(duplicates).toEqual([]);
  });

  for (const village of villages) {
    describe(`village: ${village.name} (${village.id})`, () => {
      it("has a well-formed ID in an official district", () => {
        expect(village.id).toMatch(VILLAGE_ID_PATTERN);
        const district = village.id.split("/")[0];
        expect(DISTRICT_IDS as readonly string[]).toContain(district);
      });

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

      // An entry may have no details: the book often prints a name or a
      // remark on its own line. Record those as `details: []`.
      const sections = {
        saotamaitai: village.saotamaitai,
        malaeFono: village.malaeFono,
        maotaOAlii: village.maotaOAlii,
        maotaMaMalae: village.maotaMaMalae,
        maota: village.maota,
        igoaIpu: village.igoaIpu,
        ipuATamaitai: village.ipuATamaitai,
      };

      for (const [section, entries] of Object.entries(sections)) {
        if (!entries) continue;

        it(`has non-empty titles in ${section}`, () => {
          entries.forEach((entry) => {
            expect(entry.title.trim().length).toBeGreaterThan(0);
          });
        });

        it(`has a details array on every ${section} entry`, () => {
          entries.forEach((entry) => {
            expect(Array.isArray(entry.details)).toBe(true);
          });
        });
      }
    });
  }
});

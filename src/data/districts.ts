/**
 * The 11 official districts (itūmālō) of Samoa, as lowercase ASCII slugs.
 *
 * The first part of every village ID is one of these. The district a book
 * edition prints (for example "O le Itu-o-Tane") is kept separately in
 * `Village.district` and is for display only.
 */
export const DISTRICT_IDS = [
  "tuamasaga",
  "aana",
  "aiga-i-le-tai",
  "atua",
  "vaa-o-fonoti",
  "faasaleleaga",
  "gagaemauga",
  "gagaifomauga",
  "vaisigano",
  "satupaitea",
  "palauli",
] as const;

export type DistrictId = (typeof DISTRICT_IDS)[number];

/**
 * A global village ID: `<district>/<village>`, for example `vaisigano/fagasa`.
 *
 * Lowercase ASCII with hyphens; no macrons or glottal stops. An ID names the
 * village, not the record, so every edition of a village shares one ID. Once
 * assigned it never changes. See DATA_CONVENTIONS.md, section 3.
 */
export type VillageId = `${DistrictId}/${string}`;

/** Matches a well-formed village ID. The district part is checked separately. */
export const VILLAGE_ID_PATTERN = /^[a-z]+(-[a-z]+)*\/[a-z]+(-[a-z]+)*$/;

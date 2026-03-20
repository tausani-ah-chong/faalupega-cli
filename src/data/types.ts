/**
 * A title entry pairing a matai title with its details.
 * The em-dash relationship (Title — Detail) is the core pattern in faalupega.
 *
 * Used across all sections: Sa'otama'ita'i, Malae-Fono, Maota o Alii, and Igoa-Ipu.
 * Simple sections use a 1-element details array; Igoa-Ipu entries may have multiple.
 */
export interface TitleEntry {
  title: string;
  details: string[];
}

/**
 * A complete faalupega record for a Samoan village.
 *
 * All text uses correct Samoan orthography:
 * - Macrons: ā, ē, ī, ō, ū
 * - Glottal stops: ʻ (U+02BB)
 */
export const DEFAULT_VERSION = "1930";

export interface Village {
  /** Version identifier, e.g. "1930" */
  version: string;

  /** Village name with correct diacritics, e.g. "Puipa'a" */
  name: string;

  /** District name, e.g. "Faleata" */
  district: string;

  /** Island name: "Upolu" or "Savai'i" */
  island: string;

  /** Opening salutations — some villages have multiple */
  tulou: string[];

  /** Sa'otama'ita'i — female matai titles and their connections */
  saotamaitai: TitleEntry[];

  /** Malae-Fono — meeting grounds and council areas */
  malaeFono: TitleEntry[];

  /** Maota o Alii — houses of chiefs */
  maotaOAlii: TitleEntry[];

  /** Maota ma Malae — houses and meeting grounds (not all villages have this) */
  maotaMaMalae?: TitleEntry[];

  /** Maota — houses of chiefs without the 'o Alii' qualifier (not all villages have this) */
  maota?: TitleEntry[];

  /** Igoa-Ipu a Alii — kava cup names of chiefs (includes Sāvali as final entry) */
  igoaIpu: TitleEntry[];

  /** Aualuma o Tane — names of the men's assembly (not all villages have this) */
  aualumaOTane?: string[];

  /** Ipu a Tamaʻitaʻi — kava cups of female chiefs (not all villages have this) */
  ipuATamaitai?: TitleEntry[];

  /** Sāvali — the village messenger/traveling representative (not all villages have this) */
  savali?: string;

  /** ʻAva a Talima — traditional chant associated with some villages (not all villages have this) */
  avaATalima?: string;
}

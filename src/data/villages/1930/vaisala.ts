import { Village } from "../../types.js";

export const vaisala: Village = {
  version: "1930",
  name: "Vaisala",
  district: "O le Itu-o-Tane",
  island: "Savaiʻi",

  tulou: [
    "Tulouna a oe Safune",
    "Taulauniu, o Gale ma Tuiasau",
    "Sa Oloʻapu",
    "lau Susuga le Gafa",
    "Afio mai au Afioga a Toomata",
    "Afio mai Vaai o le alo-alii",
    "Tulouna a sa Tapu ma le Atimanutai",
  ],

  malaeFono: [
    { title: "Faletagaloa", details: [] },
  ],

  maotaOAlii: [
    { title: "Vaai", details: ["Falepau"] },
    { title: "Toomata", details: ["Maota"] },
    { title: "Tagaloa", details: ["Faletagaloa"] },
    { title: "Tapu", details: ["Falefaaʻea"] },
  ],

  igoaIpu: [
    { title: "Vaai", details: ["Lagofaatasi"] },
    { title: "Toomata", details: ["Puleiʻaʻava"] },
    { title: "Vaipule", details: ["E tapa fua"] },
    { title: "Tagaloa", details: ["Tauese talitali le ipu, a e taute le Tagaloa"] },
  ],

  aualumaOTane: ["Sa Leota. Lana ipu—Puleiʻaʻava"],

  saotamaitai: [
    { title: "Toomata", details: ["Iliganoa"] },
    { title: "Vaipule", details: ["Leofao"] },
    { title: "Vaai", details: ["Lanilepapa"] },
    { title: "Tapu", details: ["Filiiʻamata"] },
  ],
};

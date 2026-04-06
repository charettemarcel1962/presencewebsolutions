/**
 * Normalisation des textes métier pour affichage (NatCORE / CéraBec).
 * Décode les entités HTML usuelles en caractères Unicode, sans interpréter du HTML actif.
 * Les espaces insécables (y compris &nbsp;) deviennent des espaces U+0020 pour un rendu lisible.
 *
 * @param {string | null | undefined} input
 * @returns {string}
 */
const NAMED_ENTITIES = {
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  hellip: "…",
  copy: "©",
  reg: "®",
  trade: "™",
  euro: "€",
  laquo: "\u00AB",
  raquo: "\u00BB",
  mdash: "—",
  ndash: "–",
  ouml: "ö",
  eacute: "é",
  egrave: "è",
  agrave: "à",
  ccedil: "ç",
};

/**
 * Une passe de décodage : numériques, entités nommées (sauf amp), puis &amp; → &.
 * @param {string} s
 * @returns {string}
 */
function decodeHtmlEntitiesOnce(s) {
  let t = s.replace(/\u00A0/g, " ");
  t = t.replace(/&nbsp;/gi, " ");
  t = t.replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
    const cp = parseInt(hex, 16);
    if (Number.isNaN(cp) || cp < 0 || cp > 0x10ffff) return _;
    return String.fromCodePoint(cp);
  });
  t = t.replace(/&#(\d+);/g, (_, dec) => {
    const cp = parseInt(dec, 10);
    if (Number.isNaN(cp) || cp < 0 || cp > 0x10ffff) return _;
    return String.fromCodePoint(cp);
  });
  t = t.replace(/&([a-z]+);/gi, (full, name) => {
    const n = name.toLowerCase();
    if (n === "amp") return full;
    if (NAMED_ENTITIES[n] != null) return NAMED_ENTITIES[n];
    return full;
  });
  t = t.replace(/&amp;/gi, "&");
  return t;
}

export function normalizeDisplayText(input) {
  if (input == null) return "";
  let s = String(input);
  if (!s) return "";
  let prev;
  let i = 0;
  do {
    prev = s;
    s = decodeHtmlEntitiesOnce(s);
    i += 1;
  } while (s !== prev && i < 14);
  return s.replace(/\u00A0/g, " ");
}

/**
 * Alias explicite pour la même règle (API stable pour appels métier).
 * @param {string | null | undefined} input
 * @returns {string}
 */
export function decodeHtmlEntitiesToPlainText(input) {
  return normalizeDisplayText(input);
}

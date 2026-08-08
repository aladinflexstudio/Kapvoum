/**
 * utils/validate.js
 * Validation du format VIN (17 caractères) + algorithme de checksum officiel
 * (9ème caractère = clé de contrôle).
 *
 * But : rejeter les VIN invalides AVANT tout appel à un fournisseur payant
 * (Piège NMVTIS #2 — CLAUDE.md section 11).
 */

const TRANSLITERATION = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
  J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
  S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
};

const WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

function hasValidFormat(vin) {
  if (typeof vin !== 'string') return false;
  const cleaned = vin.trim().toUpperCase();
  return /^[A-HJ-NPR-Z0-9]{17}$/.test(cleaned);
}

function hasValidChecksum(vin) {
  const cleaned = vin.trim().toUpperCase();
  if (!hasValidFormat(cleaned)) return false;

  let sum = 0;
  for (let i = 0; i < 17; i++) {
    const char = cleaned[i];
    const value = /[0-9]/.test(char) ? parseInt(char, 10) : TRANSLITERATION[char];
    if (value === undefined) return false;
    sum += value * WEIGHTS[i];
  }

  const remainder = sum % 11;
  const expectedCheckChar = remainder === 10 ? 'X' : String(remainder);
  return cleaned[8] === expectedCheckChar;
}

/**
 * Validation complète. Retourne { valid, reason? }.
 * Le format (17 car., alphabet VIN) est bloquant.
 * Le checksum est informatif seulement (des VIN nord-américains plus
 * anciens ou hors-normes peuvent échouer un checksum strict sans être
 * faux) — on avertit sans rejeter.
 */
function validateVin(vin) {
  if (!hasValidFormat(vin)) {
    return { valid: false, reason: 'format' };
  }
  if (!hasValidChecksum(vin)) {
    return { valid: true, reason: 'checksum_warning' };
  }
  return { valid: true };
}

module.exports = { validateVin, hasValidFormat, hasValidChecksum };

/**
 * utils/score.js
 * KapScore et Indice Haïti — calcul par règles fixes.
 *
 * RÈGLE ABSOLUE (CLAUDE.md section 12) : ces scores sont calculés ICI,
 * par des règles fixes, AVANT tout appel à Claude API. Claude nuance et
 * interprète le résultat — il ne recalcule JAMAIS les scores.
 *
 * EXCLUSIONS DÉLIBÉRÉES (décidées août 2026, voir CLAUDE.md section 4) :
 * - Pas de "™" sur les noms (aucune marque déposée réelle)
 * - Pas de scores multiples empilés — un seul KapScore, un seul Indice Haïti
 * - Pas de prix de négociation chiffré (ex: "$8,200") — aucune donnée de
 *   marché fiable pour le justifier, risque juridique si le chiffre est faux
 * - Pas d'estimation de coûts de réparation futurs — même raison
 */

const CLAMP_MIN = 0;
const CLAMP_MAX = 10;

function clamp(n) {
  return Math.max(CLAMP_MIN, Math.min(CLAMP_MAX, n));
}

/**
 * KapScore — historique légal/mécanique du véhicule, sur 10.
 *
 * @param {object} data - Données normalisées (format interface
 *   providers/vinProvider.js) :
 *   {
 *     titleStatus: 'clean' | 'salvage' | 'rebuilt',
 *     floodDamage: boolean,
 *     accidentCount: number,
 *     ownerCount: number,
 *     theftRecord: boolean,
 *     odometerRollbackSuspected: boolean,
 *     mileage: number | null
 *   }
 */
function calculateKapScore(data) {
  let score = 10;
  const factors = [];

  if (data.titleStatus === 'salvage') {
    score -= 3.5;
    factors.push({ label: 'titre_salvage', delta: -3.5 });
  }
  if (data.titleStatus === 'rebuilt') {
    score -= 2.0;
    factors.push({ label: 'titre_rebuilt', delta: -2.0 });
  }
  if (data.floodDamage) {
    score -= 2.5;
    factors.push({ label: 'flood_damage', delta: -2.5 });
  }
  if (data.accidentCount >= 2) {
    score -= 1.5;
    factors.push({ label: 'accidents_2plus', delta: -1.5 });
  } else if (data.accidentCount === 1) {
    score -= 0.8;
    factors.push({ label: 'accident_1', delta: -0.8 });
  }
  if (data.ownerCount >= 4) {
    score -= 0.8;
    factors.push({ label: 'proprietaires_4plus', delta: -0.8 });
  } else if (data.ownerCount === 3) {
    score -= 0.4;
    factors.push({ label: 'proprietaires_3', delta: -0.4 });
  }
  if (data.theftRecord) {
    score -= 1.5;
    factors.push({ label: 'vol_signale', delta: -1.5 });
  }
  if (data.odometerRollbackSuspected) {
    score -= 1.5;
    factors.push({ label: 'compteur_suspect', delta: -1.5 });
  }

  // Bonus
  if (data.ownerCount === 1) {
    score += 0.3;
    factors.push({ label: 'proprietaire_unique', delta: +0.3 });
  }
  if (typeof data.mileage === 'number' && data.mileage < 80000) {
    score += 0.3;
    factors.push({ label: 'kilometrage_bas', delta: +0.3 });
  }

  const final = clamp(score);
  return { score: Math.round(final * 10) / 10, factors, verdict: verdictForScore(final) };
}

function verdictForScore(score) {
  if (score < 5) return { level: 'high_risk', kr: 'GWO RIS', en: 'HIGH RISK', color: '#C0392B' };
  if (score < 7) return { level: 'moderate_risk', kr: 'RIS MODERE', en: 'MODERATE RISK', color: '#C47B20' };
  return { level: 'good', kr: 'BON POU ACHTE', en: 'GOOD TO BUY', color: '#1A6B3C' };
}

/**
 * Indice Haïti — viabilité pratique du véhicule dans le contexte haïtien, sur 10.
 * Base 5.0 + ajustements.
 *
 * @param {object} data
 *   {
 *     make: string,
 *     bodyType: 'suv' | 'pickup' | 'crossover' | 'sedan' | 'sedan_basse',
 *     transmission: 'manual' | 'automatic' | 'cvt',
 *     engineType: 'essence' | 'diesel' | 'hybrid' | 'electric',
 *     displacementL: number | null
 *   }
 */
function calculateIndiceHaiti(data) {
  let score = 5.0;
  const factors = [];

  const make = (data.make || '').toLowerCase();
  const partsAvailability = getPartsAvailabilityScore(make);
  score += partsAvailability.delta;
  factors.push(partsAvailability);

  const bodyScore = getBodyTypeScore(data.bodyType);
  score += bodyScore.delta;
  factors.push(bodyScore);

  const transScore = getTransmissionScore(data.transmission);
  score += transScore.delta;
  factors.push(transScore);

  const engineScore = getEngineScore(data.engineType, data.displacementL);
  score += engineScore.delta;
  factors.push(engineScore);

  const final = clamp(score);
  return { score: Math.round(final * 10) / 10, factors, verdict: verdictHaitiForScore(final) };
}

function getPartsAvailabilityScore(make) {
  if (['toyota', 'honda', 'nissan'].includes(make)) {
    return { label: 'pieces_toyota_honda_nissan', delta: 2.5 };
  }
  if (['mitsubishi', 'mazda', 'hyundai', 'kia'].includes(make)) {
    return { label: 'pieces_mitsubishi_mazda_hyundai_kia', delta: 1.5 };
  }
  if (['suzuki', 'isuzu'].includes(make)) {
    return { label: 'pieces_suzuki_isuzu', delta: 1.0 };
  }
  if (['ford', 'chevrolet'].includes(make)) {
    return { label: 'pieces_ford_chevrolet', delta: 1.0 };
  }
  if (['subaru', 'volkswagen', 'bmw', 'mercedes', 'mercedes-benz'].includes(make)) {
    return { label: 'pieces_rares_cheres', delta: -1.0 };
  }
  return { label: 'pieces_marque_non_reconnue', delta: 0 };
}

function getBodyTypeScore(bodyType) {
  switch (bodyType) {
    case 'suv':
    case 'pickup':
      return { label: 'caisse_haute_suv_pickup', delta: 2.0 };
    case 'crossover':
      return { label: 'caisse_crossover', delta: 1.0 };
    case 'sedan_basse':
      return { label: 'caisse_berline_basse', delta: -1.0 };
    case 'sedan':
    default:
      return { label: 'caisse_berline_standard', delta: 0 };
  }
}

function getTransmissionScore(transmission) {
  switch (transmission) {
    case 'manual':
      return { label: 'transmission_manuelle', delta: 0.5 };
    case 'cvt':
      return { label: 'transmission_cvt', delta: -0.5 };
    case 'automatic':
    default:
      return { label: 'transmission_automatique', delta: 0 };
  }
}

function getEngineScore(engineType, displacementL) {
  if (engineType === 'diesel') {
    return { label: 'motorisation_diesel', delta: 1.0 };
  }
  if (engineType === 'hybrid' || engineType === 'electric') {
    return { label: 'motorisation_hybride_electrique', delta: -1.5 };
  }
  const d = typeof displacementL === 'number' ? displacementL : null;
  if (d !== null) {
    if (d >= 1.5 && d <= 2.0) return { label: 'motorisation_economique', delta: 0.5 };
    if (d > 4.0) return { label: 'motorisation_grosse_cylindree', delta: -0.5 };
  }
  return { label: 'motorisation_standard', delta: 0 };
}

function verdictHaitiForScore(score) {
  if (score < 5) return { level: 'not_recommended', kr: 'PA REKÒMANDE POU AYITI', en: 'NOT RECOMMENDED FOR HAITI', color: '#C0392B' };
  if (score < 7) return { level: 'acceptable', kr: 'AKSEPTAB AK PREKOSYON', en: 'ACCEPTABLE WITH CAUTION', color: '#C47B20' };
  return { level: 'excellent', kr: 'EKSELAN POU AYITI', en: 'EXCELLENT FOR HAITI', color: '#1A6B3C' };
}

module.exports = { calculateKapScore, calculateIndiceHaiti };

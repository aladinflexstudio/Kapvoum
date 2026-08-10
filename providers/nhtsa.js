/**
 * providers/nhtsa.js
 * Décodage VIN gratuit via l'API officielle NHTSA (gouvernement US).
 * Toujours utilisé, quel que soit le fournisseur payant actif —
 * c'est la seule source garantie sans coût.
 */


const DECODE_URL = 'https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues';
const RECALLS_URL = 'https://api.nhtsa.gov/recalls/recallsByVehicle';

/**
 * Décode un VIN via NHTSA. Retourne les infos de base normalisées.
 */
async function decode(vin) {
  const url = `${DECODE_URL}/${encodeURIComponent(vin)}?format=json`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`NHTSA decode error: ${res.status}`);
  }
  const data = await res.json();
  const r = data.Results && data.Results[0];

  if (!r || (!r.Make && r.ErrorCode && r.ErrorCode !== '0')) {
    const err = new Error('VIN invalide ou non reconnu par NHTSA');
    err.code = 'INVALID_VIN';
    throw err;
  }

  return {
    make: r.Make || null,
    model: r.Model || null,
    year: r.ModelYear || null,
    trim: r.Trim || null,
    engine: [r.DisplacementL ? `${parseFloat(r.DisplacementL).toFixed(1)}L` : '', r.EngineCylinders ? `${r.EngineCylinders} cyl` : '']
      .filter(Boolean).join(' ') || null,
    displacementL: r.DisplacementL ? parseFloat(r.DisplacementL) : null,
    transmission: r.TransmissionStyle || null,
    fuelType: r.FuelTypePrimary || null,
    doors: r.Doors || null,
    bodyClass: r.BodyClass || null,
    plantCountry: r.PlantCountry || null,
  };
}

/**
 * Récupère les rappels de sécurité actifs pour ce véhicule (make/model/year).
 */
async function getRecalls({ make, model, year }) {
  if (!make || !model || !year) return [];
  const url = `${RECALLS_URL}?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${encodeURIComponent(year)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).slice(0, 10).map(r => ({
      component: r.Component || null,
      summary: r.Summary || null,
      remedy: r.Remedy || null,
      reportReceivedDate: r.ReportReceivedDate || null,
    }));
  } catch (e) {
    // Les rappels sont un bonus — une erreur ici ne doit jamais bloquer le decode principal
    return [];
  }
}

module.exports = { decode, getRecalls };

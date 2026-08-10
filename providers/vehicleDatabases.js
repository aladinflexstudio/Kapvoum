/**
 * providers/vehicleDatabases.js
 * Adaptateur pour Vehicle Databases — endpoint Title Check.
 *
 * Endpoint réel confirmé par test manuel (août 2026) :
 *   GET https://api.vehicledatabases.com/title-check/{VIN}
 *   Header : x-AuthKey: <VEHICLE_DATABASES_API_KEY>
 *
 * Réponse succès observée :
 *   { "status": "success", "vin": "...", "data": { "salvage": bool, "salvage_details": [] } }
 *
 * ATTENTION — observé en sandbox : cet endpoint ne valide PAS le format du
 * VIN et ne signale jamais "VIN non trouvé" (renvoie "success" même pour un
 * VIN inventé ou tronqué). La validation format+checksum de
 * utils/validate.js (appelée AVANT cet appel dans routes/vin.js) reste donc
 * la seule vraie protection contre les lookups inutiles côté Kapvoum
 * (Piège NMVTIS #2, CLAUDE.md section 11).
 *
 * Limite de couverture : le Title Check ne renvoie QUE le statut salvage.
 * Odomètre, accidents, nombre de propriétaires et vol ne sont pas couverts
 * par cet endpoint — laissés vides/null dans le format normalisé ci-dessous.
 */

const API_URL = 'https://api.vehicledatabases.com/title-check';
// Latence observée en sandbox : ~8-9s par appel (mesuré directement, hors
// réseau applicatif). 15s laisse une marge raisonnable sans bloquer
// indéfiniment la route /api/full-report en cas de vrai problème réseau.
const TIMEOUT_MS = 15000;

async function getHistory(vin) {
  if (!process.env.VEHICLE_DATABASES_API_KEY) {
    const err = new Error(
      'Vehicle Databases non configuré — VEHICLE_DATABASES_API_KEY manquante.'
    );
    err.code = 'PROVIDER_NOT_CONFIGURED';
    throw err;
  }

  let response;
  try {
    response = await fetch(`${API_URL}/${encodeURIComponent(vin)}`, {
      headers: { 'x-AuthKey': process.env.VEHICLE_DATABASES_API_KEY },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (networkErr) {
    const isTimeout = networkErr.name === 'TimeoutError' || networkErr.name === 'AbortError';
    const err = new Error(
      isTimeout
        ? `Vehicle Databases : délai dépassé (${TIMEOUT_MS}ms) sur le Title Check.`
        : `Vehicle Databases : erreur réseau — ${networkErr.message}`
    );
    err.code = isTimeout ? 'PROVIDER_TIMEOUT' : 'PROVIDER_NETWORK_ERROR';
    throw err;
  }

  if (response.status === 401 || response.status === 403) {
    const err = new Error('Vehicle Databases : clé API invalide ou abonnement inactif.');
    err.code = 'PROVIDER_AUTH_FAILED';
    throw err;
  }

  if (response.status === 404) {
    const err = new Error(`Vehicle Databases : VIN non trouvé (${vin}).`);
    err.code = 'VIN_NOT_FOUND';
    throw err;
  }

  if (!response.ok) {
    const err = new Error(`Vehicle Databases : erreur API (HTTP ${response.status}).`);
    err.code = 'PROVIDER_ERROR';
    throw err;
  }

  let body;
  try {
    body = await response.json();
  } catch (parseErr) {
    const err = new Error('Vehicle Databases : réponse invalide (JSON illisible).');
    err.code = 'PROVIDER_ERROR';
    throw err;
  }

  if (body.status !== 'success' || !body.data) {
    const err = new Error(
      `Vehicle Databases : réponse inattendue — ${body.message || JSON.stringify(body)}`
    );
    err.code = 'PROVIDER_ERROR';
    throw err;
  }

  return normalize(body.data);
}

/**
 * Mappe la réponse Title Check vers le format normalisé attendu par
 * vinProvider.js (CLAUDE.md section 6bis). Seul le statut salvage est
 * couvert par cet endpoint.
 */
function normalize(data) {
  return {
    title: {
      salvage: Boolean(data.salvage),
      brands: extractBrands(data.salvage_details),
      lastTitleState: null,
      lastTitleDate: null,
    },
    odometer: [],
    accidents: [],
    theftRecord: false,
  };
}

function extractBrands(salvageDetails) {
  if (!Array.isArray(salvageDetails) || salvageDetails.length === 0) return [];
  return salvageDetails.map((d) => {
    if (typeof d === 'string') return d;
    if (d && typeof d === 'object') return d.brand || d.type || d.description || JSON.stringify(d);
    return String(d);
  });
}

module.exports = { getHistory };

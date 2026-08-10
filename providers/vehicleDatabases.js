/**
 * providers/vehicleDatabases.js
 * Adaptateur pour Vehicle Databases (fournisseur backup/test envisagé —
 * 15 crédits gratuits sans CB — PAS ENCORE CHOISI ni configuré).
 *
 * Même statut que clearvin.js : squelette en attente de la décision
 * Priorité 0 (CLAUDE.md section 10).
 */


async function getHistory(vin) {
  if (!process.env.VEHICLE_DATABASES_API_KEY) {
    const err = new Error(
      'Vehicle Databases non configuré — VEHICLE_DATABASES_API_KEY manquante. ' +
      'Voir CLAUDE.md section 10, Priorité 0 (sélection du fournisseur VIN).'
    );
    err.code = 'PROVIDER_NOT_CONFIGURED';
    throw err;
  }

  // TODO une fois la clé obtenue :
  // const res = await fetch(`https://api.vehicledatabases.com/vehicle-history/${vin}`, {
  //   headers: { 'x-AuthKey': process.env.VEHICLE_DATABASES_API_KEY }
  // });
  // ... mapper la réponse vers le format normalisé.
  // ⚠️ Piège #3 (CLAUDE.md section 11) : vérifier le coût TOTAL d'un rapport
  // complet, les endpoints sont souvent facturés séparément.

  throw new Error('Vehicle Databases adapter non implémenté — squelette uniquement.');
}

module.exports = { getHistory };

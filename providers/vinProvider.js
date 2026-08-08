/**
 * providers/vinProvider.js
 * Point d'entrée UNIQUE pour toute requête VIN. server.js et les routes
 * ne doivent JAMAIS appeler un fournisseur directement (règle absolue,
 * CLAUDE.md section 12 — c'est ce qui a coûté le problème VinAudit).
 *
 * Changer de fournisseur = changer VIN_PROVIDER dans .env, rien d'autre.
 */

const nhtsa = require('./nhtsa');
const clearvin = require('./clearvin');
const vehicleDatabases = require('./vehicleDatabases');

const paidProviders = {
  clearvin,
  vehicledatabases: vehicleDatabases,
};

/**
 * Decode gratuit + rappels — toujours disponible, aucune clé requise.
 */
async function getFreeVehicleInfo(vin) {
  const decoded = await nhtsa.decode(vin);
  const recalls = await nhtsa.getRecalls(decoded);
  return {
    vin,
    decoded,
    recalls,
    provider: 'nhtsa',
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Rapport complet — nécessite un fournisseur payant configuré.
 * Lève une erreur explicite si VIN_PROVIDER pointe vers un fournisseur
 * non configuré (au lieu d'échouer silencieusement).
 */
async function getFullVehicleReport(vin) {
  const activeProvider = process.env.VIN_PROVIDER || 'nhtsa';

  const decoded = await nhtsa.decode(vin);
  const recalls = await nhtsa.getRecalls(decoded);

  if (activeProvider === 'nhtsa') {
    const err = new Error(
      'Aucun fournisseur VIN payant configuré (VIN_PROVIDER=nhtsa). ' +
      'Le rapport complet nécessite ClearVin ou Vehicle Databases — ' +
      'voir CLAUDE.md section 10, Priorité 0.'
    );
    err.code = 'NO_PAID_PROVIDER';
    throw err;
  }

  const provider = paidProviders[activeProvider];
  if (!provider) {
    throw new Error(`VIN_PROVIDER inconnu : "${activeProvider}"`);
  }

  const history = await provider.getHistory(vin);

  return {
    vin,
    decoded,
    recalls,
    ...history,
    provider: activeProvider,
    fetchedAt: new Date().toISOString(),
  };
}

module.exports = { getFreeVehicleInfo, getFullVehicleReport };

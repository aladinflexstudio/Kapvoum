/**
 * providers/clearvin.js
 * Adaptateur pour ClearVin (fournisseur NMVTIS payant envisagé — Priorité 0
 * du CLAUDE.md, PAS ENCORE CHOISI ni configuré).
 *
 * STATUT : squelette en attente. À implémenter une fois :
 *   1. Le choix ClearVin vs Vehicle Databases tranché (test des 5 VIN types)
 *   2. Les 5 questions de conformité posées et répondues par email
 *   3. CLEARVIN_API_KEY obtenue
 *
 * Ce fichier respecte déjà l'interface normalisée attendue par
 * vinProvider.js — une fois la vraie API branchée, rien d'autre à changer
 * ailleurs dans le code.
 */

async function getHistory(vin) {
  if (!process.env.CLEARVIN_API_KEY) {
    const err = new Error(
      'ClearVin non configuré — CLEARVIN_API_KEY manquante. ' +
      'Voir CLAUDE.md section 10, Priorité 0 (sélection du fournisseur VIN).'
    );
    err.code = 'PROVIDER_NOT_CONFIGURED';
    throw err;
  }

  // TODO une fois la clé obtenue et le contrat de redistribution confirmé :
  // const res = await fetch(`https://api.clearvin.com/...`, {
  //   headers: { Authorization: `Bearer ${process.env.CLEARVIN_API_KEY}` }
  // });
  // ... mapper la réponse vers le format normalisé ci-dessous.

  throw new Error('ClearVin adapter non implémenté — squelette uniquement.');

  // Format de sortie attendu (voir CLAUDE.md section 6bis) :
  // return {
  //   title: { brands: [], salvage: false, lastTitleState: null, lastTitleDate: null },
  //   odometer: [{ reading: null, date: null, source: null }],
  //   accidents: [],
  //   theftRecord: false,
  // };
}

module.exports = { getHistory };

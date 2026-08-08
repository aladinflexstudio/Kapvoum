/**
 * routes/vin.js
 * Routes VIN — décodage gratuit et rapport complet.
 */

const express = require('express');
const router = express.Router();
const vinProvider = require('../providers/vinProvider');
const { validateVin } = require('../utils/validate');

/**
 * POST /api/check-vin
 * Décodage gratuit (NHTSA) + rappels. Pas de paiement requis.
 * Body: { vin: string }
 */
router.post('/check-vin', async (req, res) => {
  const { vin } = req.body || {};

  const validation = validateVin(vin);
  if (!validation.valid) {
    return res.status(400).json({ error: 'VIN invalide', reason: validation.reason });
  }

  try {
    const info = await vinProvider.getFreeVehicleInfo(vin.trim().toUpperCase());
    res.json({ ...info, checksumWarning: validation.reason === 'checksum_warning' });
  } catch (err) {
    if (err.code === 'INVALID_VIN') {
      return res.status(404).json({ error: 'VIN non reconnu par NHTSA' });
    }
    console.error('Erreur /check-vin:', err);
    res.status(502).json({ error: 'Erreur lors de la vérification du VIN' });
  }
});

/**
 * POST /api/full-report
 * Rapport complet — nécessite un fournisseur payant configuré ET
 * (à terme) un paiement confirmé. Le contrôle de paiement sera ajouté
 * dans routes/payment.js une fois Stripe/MonCash connectés.
 *
 * STATUT ACTUEL : retourne 501 tant que VIN_PROVIDER=nhtsa (par défaut),
 * car aucun fournisseur payant n'est encore choisi/configuré.
 * Body: { vin: string }
 */
router.post('/full-report', async (req, res) => {
  const { vin } = req.body || {};

  const validation = validateVin(vin);
  if (!validation.valid) {
    return res.status(400).json({ error: 'VIN invalide', reason: validation.reason });
  }

  try {
    const report = await vinProvider.getFullVehicleReport(vin.trim().toUpperCase());
    res.json(report);
  } catch (err) {
    if (err.code === 'NO_PAID_PROVIDER' || err.code === 'PROVIDER_NOT_CONFIGURED') {
      return res.status(501).json({ error: err.message, code: err.code });
    }
    if (err.code === 'INVALID_VIN') {
      return res.status(404).json({ error: 'VIN non reconnu par NHTSA' });
    }
    console.error('Erreur /full-report:', err);
    res.status(502).json({ error: 'Erreur lors de la génération du rapport' });
  }
});

module.exports = router;

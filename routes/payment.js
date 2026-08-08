/**
 * routes/payment.js
 * Routes de paiement — Stripe et MonCash.
 *
 * STATUT : squelette. Aucun des deux n'est encore connecté
 * (STRIPE_SECRET_KEY et MONCASH_CLIENT_ID absents de .env).
 * Retourne 501 explicite plutôt que d'échouer silencieusement.
 */

const express = require('express');
const router = express.Router();

router.post('/stripe', async (req, res) => {
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(501).json({
      error: 'Stripe non configuré — STRIPE_SECRET_KEY manquante.',
      code: 'STRIPE_NOT_CONFIGURED',
    });
  }
  // TODO une fois Stripe connecté :
  // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  // ... créer une session de paiement, gérer le webhook de confirmation.
  res.status(501).json({ error: 'Route Stripe non implémentée.' });
});

router.post('/moncash', async (req, res) => {
  if (!process.env.MONCASH_CLIENT_ID) {
    return res.status(501).json({
      error: 'MonCash non configuré — en attente activation Antrepriz (code PIN).',
      code: 'MONCASH_NOT_CONFIGURED',
    });
  }
  // TODO une fois MonCash activé : intégration npm 'moncash'.
  // Rappel (CLAUDE.md section 12) : ne pas sur-automatiser avant
  // validation du marché — la validation manuelle + Google Sheet
  // reste acceptable pour le MVP.
  res.status(501).json({ error: 'Route MonCash non implémentée.' });
});

module.exports = router;

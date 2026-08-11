/**
 * routes/payment.js
 * Routes de paiement — Stripe et MonCash.
 *
 * STATUT MonCash : squelette (MONCASH_CLIENT_ID absent de .env).
 *
 * Stripe : Checkout Session (mode paiement unique) pour le rapport Kapvoum
 * à $14.99. Compte Stripe partagé "AladinFlex LLC" (plusieurs projets) —
 * chaque session DOIT porter metadata.project="kapvoum" pour le traçage des
 * revenus par projet dans les rapports Stripe. Ne jamais retirer ce champ.
 */

const express = require('express');
const router = express.Router();
const { validateVin } = require('../utils/validate');

// Price ID Kapvoum ($14.99, paiement unique) — compte AladinFlex LLC.
// Overridable via STRIPE_PRICE_ID si le price change sans toucher au code.
const KAPVOUM_PRICE_ID = process.env.STRIPE_PRICE_ID || 'price_1U33tlFQ895XvzzaHFL4cz0b';

router.post('/stripe', async (req, res) => {
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(501).json({
      error: 'Stripe non configuré — STRIPE_SECRET_KEY manquante.',
      code: 'STRIPE_NOT_CONFIGURED',
    });
  }

  const { vin } = req.body || {};
  const validation = validateVin(vin);
  if (!validation.valid) {
    return res.status(400).json({ error: 'VIN invalide', reason: validation.reason });
  }
  const cleanVin = vin.trim().toUpperCase();

  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: KAPVOUM_PRICE_ID, quantity: 1 }],
      metadata: { project: 'kapvoum', vin: cleanVin },
      success_url: `${baseUrl}/?vin=${encodeURIComponent(cleanVin)}&payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/?vin=${encodeURIComponent(cleanVin)}&payment=cancelled`,
    });

    res.json({ url: session.url });
  } catch (err) {
    if (err.type === 'StripeAuthenticationError') {
      console.error('Erreur Stripe (clé invalide):', err.message);
      return res.status(502).json({ error: 'Paiement indisponible — configuration Stripe invalide.', code: 'STRIPE_AUTH_FAILED' });
    }
    if (err.type === 'StripeInvalidRequestError') {
      console.error('Erreur Stripe (requête invalide):', err.message);
      return res.status(502).json({ error: 'Paiement indisponible — configuration du produit invalide.', code: 'STRIPE_INVALID_REQUEST' });
    }
    console.error('Erreur Stripe:', err);
    res.status(502).json({ error: 'Erreur lors de la création de la session de paiement.', code: 'STRIPE_ERROR' });
  }
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

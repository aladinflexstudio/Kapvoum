/**
 * server.js
 * Point d'entrée Kapvoum — Express.
 *
 * Remplace le server.js minimal de 14 lignes (qui ne faisait que servir
 * index.html) par une vraie architecture avec routes API.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');

const vinRoutes = require('./routes/vin');
const paymentRoutes = require('./routes/payment');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname))); // sert index.html tel quel, inchangé

// Rate limiting sur les routes VIN — max 5 requêtes/minute/IP
// (CLAUDE.md section 10, Priorité 2 — protège le coût API fournisseur)
const vinLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Twòp demann. Tanpri tann yon minit.' },
});

// ── Routes ──
app.use('/api', vinLimiter, vinRoutes);
app.use('/api/payment', paymentRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    vinProvider: process.env.VIN_PROVIDER || 'nhtsa',
    stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
    moncashConfigured: Boolean(process.env.MONCASH_CLIENT_ID),
    claudeConfigured: Boolean(process.env.ANTHROPIC_API_KEY),
    supabaseConfigured: Boolean(process.env.SUPABASE_URL),
  });
});

// ── 404 API ──
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Route API introuvable' });
});

// ── Démarrage ──
app.listen(PORT, () => {
  console.log(`Kapvoum server démarré sur le port ${PORT}`);
  console.log(`Fournisseur VIN actif : ${process.env.VIN_PROVIDER || 'nhtsa'}`);
});

module.exports = app;

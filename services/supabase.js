/**
 * services/supabase.js
 * Interactions base de données — orders, reports, vin_cache.
 * STATUT : squelette — projet Supabase pas encore créé
 * (SUPABASE_URL/SUPABASE_SERVICE_KEY absents de .env).
 *
 * Schéma cible (CLAUDE.md section 6) :
 *   orders: id, vin, email, name, payment_method, payment_id, amount, status, created_at
 *   reports: id, order_id, vin, nhtsa_data, provider_data, claude_output,
 *            kapscore, indice_haiti, pdf_url, created_at
 *   vin_cache: vin (PK), report_data, created_at, expires_at
 */

function getClient() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    const err = new Error('Supabase non configuré — SUPABASE_URL/SUPABASE_SERVICE_KEY manquantes.');
    err.code = 'SUPABASE_NOT_CONFIGURED';
    throw err;
  }
  const { createClient } = require('@supabase/supabase-js');
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
}

/**
 * Vérifie si un rapport existe déjà en cache pour ce VIN (évite un appel
 * fournisseur payant en double — CLAUDE.md section 6, étape 6 du flow).
 */
async function getCachedReport(vin) {
  const client = getClient();
  const { data, error } = await client
    .from('vin_cache')
    .select('*')
    .eq('vin', vin)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function cacheReport(vin, reportData, expiresAt) {
  const client = getClient();
  const { error } = await client
    .from('vin_cache')
    .upsert({ vin, report_data: reportData, expires_at: expiresAt });
  if (error) throw error;
}

module.exports = { getClient, getCachedReport, cacheReport };

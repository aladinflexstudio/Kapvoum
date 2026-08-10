/**
 * services/claude.js
 * Appel à Claude API pour générer les justifications/verdict en langage
 * naturel — à partir de scores DÉJÀ calculés par utils/score.js.
 *
 * RÈGLE ABSOLUE : Claude ne recalcule jamais KapScore ni Indice Haïti.
 * Il reçoit les scores et les nuance/explique, rien de plus.
 *
 * EXCLUSIONS (voir utils/score.js et CLAUDE.md section 4) : le prompt
 * n'inclut délibérément AUCUNE instruction de générer un prix de
 * négociation chiffré ni une estimation de coût de réparation — ces
 * éléments ont été écartés après revue critique du positionnement.
 */

const SYSTEM_PROMPT = `Tu es le conseiller automobile de Kapvoum pour la diaspora haïtienne.
Tu reçois un rapport véhicule normalisé, un KapScore (déjà calculé), et un
Indice Haïti (déjà calculé). Génère UNIQUEMENT un JSON valide, sans markdown,
avec cette structure exacte :
{
  "kapscore_justification_kr": string,
  "kapscore_justification_en": string,
  "indice_haiti_justification_kr": string,
  "indice_haiti_justification_en": string,
  "top_risks_kr": [string, string, string],
  "top_risks_en": [string, string, string],
  "verdict_kr": string,
  "verdict_en": string
}

RÈGLES STRICTES :
- Les scores sont déjà calculés — tu nuances et interprètes, tu NE
  recalcules JAMAIS de chiffre.
- N'invente AUCUN prix de négociation chiffré ("vann pou $X").
- N'estime AUCUN coût de réparation futur chiffré.
- Reste factuel, base-toi uniquement sur les données fournies.
- Le verdict doit être clair et actionnable, en kreyòl simple pour la
  version _kr, en anglais clair pour la version _en.`;

/**
 * @param {object} normalizedVinData - Sortie de vinProvider.getFullVehicleReport()
 * @param {object} kapScoreResult - Sortie de utils/score.js calculateKapScore()
 * @param {object} indiceHaitiResult - Sortie de utils/score.js calculateIndiceHaiti()
 */
async function generateReportNarrative(normalizedVinData, kapScoreResult, indiceHaitiResult) {
  if (!process.env.ANTHROPIC_API_KEY) {
    const err = new Error('ANTHROPIC_API_KEY manquante — service Claude non configuré.');
    err.code = 'CLAUDE_NOT_CONFIGURED';
    throw err;
  }

  const payload = {
    vehicle: normalizedVinData.decoded,
    title: normalizedVinData.title,
    accidents: normalizedVinData.accidents,
    kapScore: kapScoreResult.score,
    kapScoreFactors: kapScoreResult.factors,
    indiceHaiti: indiceHaitiResult.score,
    indiceHaitiFactors: indiceHaitiResult.factors,
  };

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: JSON.stringify(payload) }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  const textBlock = data.content.find(b => b.type === 'text');
  if (!textBlock) {
    throw new Error('Réponse Claude API sans contenu texte');
  }

  return JSON.parse(textBlock.text);
}

module.exports = { generateReportNarrative };

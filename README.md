# Kapvoum Backend — v2.0.0-alpha

Première version réelle du backend Node.js, en remplacement du `server.js`
minimal de 14 lignes. Construit à partir de `CLAUDE.md` (architecture cible).

## ✅ Ce qui fonctionne dès maintenant (aucune clé API requise)

- **Décodage VIN gratuit** via NHTSA (`POST /api/check-vin`)
- **Rappels de sécurité** via NHTSA (inclus dans la même route)
- **Validation VIN complète** : format 17 caractères + algorithme de
  checksum officiel (9ème caractère) — `utils/validate.js`
- **KapScore et Indice Haïti** : calcul par règles fixes, testé et
  vérifié — `utils/score.js`
- **Architecture providers** : couche d'abstraction en place
  (`providers/vinProvider.js`), prête à recevoir ClearVin ou Vehicle
  Databases sans toucher au reste du code
- **Rate limiting** : 5 requêtes/minute/IP sur les routes VIN
- **Route santé** : `GET /api/health` — indique quels services sont
  configurés

## ⏳ Squelettes en attente (structure prête, clés API manquantes)

| Fichier | Attend |
|---|---|
| `providers/clearvin.js` | Choix du fournisseur (Priorité 0) + clé API |
| `providers/vehicleDatabases.js` | Choix du fournisseur (Priorité 0) + clé API |
| `routes/payment.js` (Stripe) | Compte Stripe connecté |
| `routes/payment.js` (MonCash) | Activation MonCash Antrepriz (code PIN) |
| `services/claude.js` | ANTHROPIC_API_KEY (fonctionnera dès que le fournisseur VIN payant sera actif) |
| `services/pdf.js` | Contenu complet une fois le format de données du vrai fournisseur connu |
| `services/email.js` | Compte Resend connecté |
| `services/supabase.js` | Projet Supabase créé |

Chaque squelette lève une erreur explicite (501 côté API) plutôt que
d'échouer silencieusement — pas de faux positifs.

## Comment démarrer en local

```bash
npm install
cp .env.example .env
npm start
```

Par défaut (`VIN_PROVIDER=nhtsa` dans `.env.example`), seul
`/api/check-vin` fonctionnera pleinement — `/api/full-report` renverra
une 501 explicite tant qu'aucun fournisseur payant n'est configuré.

## Tester rapidement

```bash
curl -X POST http://localhost:3000/api/check-vin \
  -H "Content-Type: application/json" \
  -d '{"vin":"1HGCM82633A004352"}'
```

## Exclusions délibérées (voir CLAUDE.md section 4)

Ces éléments ont été volontairement écartés après revue critique du
positionnement (août 2026) — ne pas les réintroduire sans revalider :

- Pas de `™` sur KapScore/Indice Haïti (aucune marque déposée réelle)
- Pas de scores multiples empilés — un seul KapScore, un seul Indice Haïti
- Pas de prix de négociation chiffré généré par l'IA
- Pas d'estimation de coûts de réparation chiffrée générée par l'IA

## Prochaines étapes (dans l'ordre du CLAUDE.md, section 10)

1. **Priorité 0** — Trancher ClearVin vs Vehicle Databases (tester les
   5 VIN types, poser les 5 questions de conformité par email)
2. Implémenter le vrai `getHistory()` dans le provider choisi
3. Connecter Stripe
4. Activer MonCash (code PIN en attente)
5. Créer le projet Supabase (tables `orders`, `reports`, `vin_cache`)
6. Connecter Resend
7. Compléter `services/pdf.js` avec la vraie mise en page une fois le
   format de données du fournisseur connu

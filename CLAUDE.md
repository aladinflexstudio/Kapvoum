# KAPVOUM — Dossier Technique Complet
**Version : 4.0 — Document de passation pour développeur / AI agent**
**Préparé par : AladinFlex LLC — Jean-François Aladin**
**Date : Juillet 2026 — Mise à jour : KapScore, Indice Haïti, slogan, positionnement final**

> **Changements majeurs v4.0 :** "Score Kapvoum" → **KapScore** (marque propre). Ajout **Indice Haïti** (2ème score unique adapté aux conditions haïtiennes). Slogan final : "Nou pa vann rapò. Nou ede w pran bon desizyon." Positionnement validé 9.8/10 par analyse multi-AI. Kapvoum crée sa propre catégorie : Decision Intelligence, pas Vehicle History Report.

---

## 0. ÉTAT RÉEL DU PROJET (mise à jour août 2026)

**IMPORTANT — à lire avant tout développement :**

Le vrai backend (Supabase, Stripe, PDFKit, Resend, Claude API, scoring KapScore/Indice Haïti) **n'a jamais été codé ni implémenté**, malgré ce que suggère la section "CE QUI EST DÉJÀ EN LIGNE" plus bas dans ce document (qui décrivait l'intention, pas la réalité). Confirmé par investigation complète du repo GitHub, du File Manager Hostinger, et de l'historique des conversations Claude — les trois ne contiennent que :
- `index.html` — frontend statique complet avec **données mockées en dur** (objet `MOCK` dans le script)
- `server.js` — 14 lignes, sert juste le HTML, aucune route API
- `package.json` / `package-lock.json` — vides, aucune dépendance

**On repart de zéro sur le backend**, à partir de maintenant, sur le MacBook Pro M5 avec Claude Code. Ce document reste la référence d'architecture cible — tout ce qui suit décrit ce qu'il FAUT construire, pas ce qui existe.

---

## 1. VUE D'ENSEMBLE DU PROJET

### Qu'est-ce que Kapvoum ?
Kapvoum est une plateforme web de vérification d'historique de véhicules ciblant le marché haïtien et la diaspora haïtienne. Le nom signifie "Konnen Anvan Ou Achte" (Sache avant d'acheter).

### Problème résolu
En Haïti, des milliers de véhicules importés des USA sont vendus sans transparence sur leur vrai historique. Les acheteurs ignorent souvent :
- Les flood damages (inondations Texas, Louisiane, Floride)
- Les accidents graves cachés sous une belle carrosserie
- Les compteurs kilométriques modifiés
- Les rappels de sécurité actifs du fabricant

### Solution Kapvoum

> ⭐ **Positionnement final (validé 9.8/10 par analyse multi-AI) :**
> Kapvoum ne vend PAS un rapport VIN. Carfax domine déjà ce marché.
> Kapvoum est **"Le conseiller automobile de la diaspora haïtienne."**
> Kapvoum crée sa propre catégorie : **Decision Intelligence**, pas Vehicle History Report.

**Slogan officiel (KR) :** *"Nou pa vann rapò. Nou ede w pran bon desizyon."*
**Slogan officiel (EN) :** *"We don't sell vehicle reports. We help you avoid expensive mistakes."*
**Tagline existante :** *"Konnen Anvan Ou Achte"* — à conserver

**La différence en une image :**
```
Carfax       → données → 15 pages en anglais → utilisateur seul face à sa décision
Kapvoum      → données → analyse IA → KapScore + Indice Haïti + verdict kreyòl → décision claire
```

**Exemple de livrable Kapvoum (ce qu'on vend vraiment) :**
```
KapScore        : 3.5/10  🔴
Indice Haïti    : 6.2/10  🟡

Verdict KR : "Pa achte machin sa a san negosyasyon fò."
Raisons    : titre Salvage • dommage inondasyon Texas 2021 • kilométraj sispèk
Conseil    : "Si ou achte li kanmenm, pa depase $8,500."
```

### Marché cible

**Marché primaire (phase 1) — B2C Diaspora USA**
- Diaspora haïtienne aux USA (Maryland, Floride, New York, Massachusetts) qui achète des véhicules pour expédier en Haïti
- Le concept de rapport véhicule existe déjà aux USA (Carfax ~$45) → pas d'éducation de catégorie nécessaire
- La proposition : verdict clair en kreyòl à $14.99 vs 15 pages en anglais technique à $45
- Paiement sans friction : Stripe actif, $14.99 trivial sur un achat de $10-20K
- Flywheel marketing : même audience qu'EducaNov/AladinFlex

**Marché secondaire (phase 2) — B2B Haïti**
- Courtiers et importateurs qui achètent des lots aux enchères US (ils comprennent déjà la valeur d'un VIN check)
- Packs de rapports (abonnement mensuel) plutôt que B2C individuel
- Ne pas cibler les acheteurs individuels en Haïti en phase 1 (éducation de marché trop coûteuse)

### Modèle économique
- Rapport complet payant : **$14.99 USD** (ou **2,500 HTG** via MonCash)
- Données de base gratuites (VIN decode + rappels NHTSA)
- Marge estimée : ~82% par rapport

---

## 2. FRONTEND EXISTANT (v4 — seul élément réellement en production)

### URL de production
**https://kapvoum.aladinflex.com**

### Infrastructure déployée
- **Hosting** : Hostinger Business (Node.js 22.x, SSL, CDN, Daily backups)
- **GitHub** : https://github.com/aladinflexstudio/Kapvoum
- **Branch** : main
- **Fichiers actuels dans le repo** :
  - `index.html` — Frontend complet (Single Page App), données mockées
  - `package.json` — vide, aucune dépendance
  - `server.js` — 14 lignes, sert juste index.html

### Ce que le frontend fait déjà (fonctionnel, côté client uniquement)

**Données gratuites réelles (appels directs depuis le navigateur vers APIs gouvernementales US) :**
- Décodage VIN complet via NHTSA VIN Decode API
  - URL : `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/{VIN}?format=json`
  - Retourne : Make, Model, Year, Engine, Transmission, Fuel, Doors, Country of manufacture
- Rappels de sécurité actifs via NHTSA Recalls API
  - URL : `https://api.nhtsa.gov/recalls/recallsByVehicle?make={make}&model={model}&modelYear={year}`
  - Retourne : Composant en rappel + description officielle

**Fiche technique embarquée (base de données interne en JS) :**
- Huile moteur, batterie (groupe), gaz AC, pression pneus avant/arrière
- Calibrée par marque et année (Toyota, Honda, Nissan, Mitsubishi, Mazda, Subaru)

**Interface utilisateur complète :**
- 4 vues : Home → Résultats → Paiement → Rapport
- Toggle Kreyòl / English instantané (toutes les chaînes traduites, pattern `data-kr` / `data-en`)
- Checklist interactive haïtienne (8 points, barre de progression)
- Score /10 calculé — **actuellement sur données MOCK codées en dur, pas de vrai calcul**
- Rapport avec verdict et conseils de négociation — **mock data**
- Section upsell vers paiement ($14.99)
- Formulaire MonCash — **pas connecté, juste UI, "succès" simulé côté client**
- Stripe — **bouton désactivé, placeholder "bientôt disponible"**
- Bouton WhatsApp support
- Impression PDF (impression navigateur uniquement, pas de vrai PDFKit)

**Design :**
- Palette : Crème (#F5F0E8), Or (#B8952A/#D4AF37), Noir (#0D0D0D)
- Typographie : Bebas Neue (titres) + Cormorant Garamond (accents italiques) + DM Sans (corps) + DM Mono (données)
- Split hero sur desktop, responsive mobile
- Grain texture overlay
- Scroll reveal animations

---

## 3. ARCHITECTURE TECHNIQUE CIBLE (À CONSTRUIRE INTÉGRALEMENT)

### Stack confirmée

```
FRONTEND
└── index.html (Single Page App, déjà en prod)
    ├── 4 vues (Home, Results, Payment, Report)
    ├── Toggle KR/EN
    └── APIs NHTSA (déjà connectées)

BACKEND (à construire — RIEN n'existe encore)
└── server.js (Node.js — Express)
    ├── POST /api/check-vin       → VIN decode (NHTSA, gratuit)
    ├── POST /api/full-report     → Rapport complet (via vinProvider.js)
    ├── POST /api/payment/stripe  → Paiement carte
    ├── POST /api/payment/moncash → Paiement MonCash
    └── GET  /api/report/:id      → Récupérer rapport stocké

COUCHE ABSTRACTION FOURNISSEUR VIN (voir section 6bis)
└── providers/
    ├── vinProvider.js          → Interface unique (routeur)
    ├── nhtsa.js                → Décodage gratuit (toujours utilisé)
    ├── clearvin.js             → Fournisseur phase 1 principal
    └── vehicleDatabases.js     → Fournisseur backup/test

DATABASE
└── Supabase (PostgreSQL) — à créer entièrement
    ├── Table: orders (id, vin, email, payment_method, status, created_at)
    ├── Table: reports (id, order_id, vin_data, score, pdf_url, provider, created_at)
    └── Table: vin_cache (vin, report_data, provider, created_at, expires_at)

PDF ENGINE
└── PDFKit (MVP) — rapide, léger

EMAIL
└── Resend API
    └── Envoie le PDF en pièce jointe après paiement confirmé

PAIEMENTS
├── Stripe — diaspora USA/Canada/Europe
└── MonCash Antrepriz — clients en Haïti (2,500 HTG fixe)

AI / CERVEAU
└── Claude API (Anthropic)
    ├── Model : claude-sonnet-4-5 (vérifier le dernier identifiant de modèle disponible au moment du build)
    ├── Input : JSON fournisseur VIN normalisé + KapScore + Indice Haïti déjà calculés
    ├── Output : Justifications + Top risques + Conseil négociation (Claude nuance, ne calcule jamais les scores)
    └── Coût estimé : ~$0.02 par rapport
```

### Flow complet d'un rapport payant

```
1. User entre VIN sur le frontend
2. Frontend appelle NHTSA (gratuit) → affiche données de base
3. User clique "Jwenn Istwa Konplè — $14.99"
4. User choisit Stripe ou MonCash
5. Paiement confirmé → server.js reçoit webhook
6. server.js vérifie cache Supabase (même VIN déjà acheté ?)
   → Si oui : retourne rapport existant (économie fournisseur)
   → Si non : continue
7. server.js appelle vinProvider.js → fournisseur actif (ClearVin en phase 1)
   → NHTSA decode (gratuit, toujours)
   → ClearVin history (payant)
   → Résultat normalisé en format standard
8. server.js calcule KapScore et Indice Haïti via utils/score.js (règles fixes)
9. server.js appelle Claude API avec le JSON normalisé + les deux scores
10. Claude génère : Justifications KR/EN + Top risques + Conseil négociation chiffré
11. server.js génère PDF avec PDFKit
    → KapScore /10 (visuel avec couleur)
    → Indice Haïti /10 (visuel avec couleur)
    → Verdict en kreyòl + conseil négociation chiffré
    → Checklist haïtienne annotée
    → Top 3 risques
    → Disclaimer NMVTIS obligatoire
    → Suggestion inspection mécanique si véhicule >$15K
12. PDF uploadé sur Supabase Storage
13. Resend envoie email avec PDF en pièce jointe
14. Frontend affiche le rapport
15. Order + provider utilisé sauvegardés dans Supabase
```

---

## 4. KAPSCORE ET INDICE HAÏTI — LOGIQUE DÉTAILLÉE

Kapvoum produit **deux scores distincts**. Aucun autre fournisseur ne fait ça.

---

### KapScore — Score historique /10

Évalue l'historique légal et mécanique du véhicule (données NMVTIS + fournisseur VIN).

#### Facteurs de déduction (règles fixes)

| Critère | Déduction |
|---|---|
| Titre Salvage | -3.5 points |
| Flood damage confirmé | -2.5 points |
| 2+ accidents | -1.5 points |
| 1 accident | -0.8 points |
| 4+ propriétaires | -0.8 points |
| 3 propriétaires | -0.4 points |
| Theft record | -1.5 points |
| Rebuilt title | -2.0 points |
| Odometer rollback suspecté | -1.5 points |

#### Facteurs bonus

| Critère | Bonus |
|---|---|
| 1 seul propriétaire | +0.3 |
| Kilométrage < 80,000 mi | +0.3 |

#### Seuils d'affichage KapScore

| Score | Verdict | Couleur |
|---|---|---|
| 0–4.9 | GWO RIS / HIGH RISK | 🔴 Rouge #C0392B |
| 5–6.9 | RIS MODERE / MODERATE RISK | 🟡 Orange #C47B20 |
| 7–10 | BON POU ACHTE / GOOD TO BUY | 🟢 Vert #1A6B3C |

---

### Indice Haïti — Score adapté aux conditions haïtiennes /10

> ⭐ **Différenciateur unique — aucun autre fournisseur ne propose ça.**
> Une Subaru avec un historique propre mais sans pièces à Port-au-Prince = mauvais achat.
> Une Toyota Corolla avec un petit accrochage mais réparable partout en Haïti = bon achat.

L'Indice Haïti évalue la **viabilité pratique** du véhicule dans le contexte haïtien.

#### Calcul Indice Haïti (règles fixes dans `utils/score.js`)

**Disponibilité pièces en Haïti :**
| Marque | Score |
|---|---|
| Toyota, Honda, Nissan | +2.5 (pièces partout) |
| Mitsubishi, Mazda, Hyundai, Kia | +1.5 |
| Suzuki, Isuzu | +1.0 |
| Ford, Chevrolet (pick-ups) | +1.0 |
| Subaru, Volkswagen, BMW, Mercedes | -1.0 (pièces rares et chères) |

**Hauteur de caisse (routes haïtiennes) :**
| Type | Score |
|---|---|
| SUV, Pick-up (4x4) | +2.0 |
| Crossover | +1.0 |
| Berline, Sedan | 0 |
| Berline basse | -1.0 |

**Transmission :**
| Type | Score |
|---|---|
| Manuelle | +0.5 (plus facile à réparer) |
| Automatique standard | 0 |
| CVT | -0.5 (réparation complexe en Haïti) |

**Motorisation :**
| Type | Score |
|---|---|
| 1.5L – 2.0L essence | +0.5 (économique) |
| 2.5L – 3.5L | 0 |
| +4.0L ou V8 | -0.5 (consommation élevée) |
| Diesel | +1.0 (carburant disponible, économique) |
| Hybride/Électrique | -1.5 (infrastructure inexistante) |

**Base de départ :** 5.0 points + ajustements

#### Seuils d'affichage Indice Haïti

| Score | Verdict | Couleur |
|---|---|---|
| 0–4.9 | PA REKÒMANDE POU AYITI | 🔴 Rouge |
| 5–6.9 | AKSEPTAB AK PREKOSYON | 🟡 Orange |
| 7–10 | EKSELAN POU AYITI | 🟢 Vert |

---

### Interprétation Claude API (après les deux scores fixes)

Claude reçoit le JSON normalisé + les deux scores calculés et génère :

```json
{
  "kapscore_justification_kr": "string",
  "kapscore_justification_en": "string",
  "indice_haiti_justification_kr": "string",
  "top_risks_kr": ["string", "string", "string"],
  "top_risks_en": ["string", "string", "string"],
  "negotiation_tip_kr": "string",
  "negotiation_tip_en": "string",
  "verdict_kr": "string",
  "verdict_en": "string",
  "price_recommendation": number
}
```

**Note :** Les scores sont calculés par des règles fixes dans `utils/score.js` AVANT d'appeler Claude. Claude nuance et interprète — il ne calcule pas. Cela garantit la cohérence et évite les hallucinations sur les chiffres.

---

## 5. LA CHECKLIST HAÏTIENNE — 8 POINTS

Conçue spécifiquement pour les conditions haïtiennes (routes, chaleur, humidité, disponibilité pièces).

**En Kreyòl :**
1. Anba machin — chèche rouiy ak tras dlo (flood)
2. Mofle — pa dwe gen bri etranj
3. Kawotchou — minimòm 40% lavi
4. Fren — teste nan 60 km/h
5. Klimatizasyon — mache pandan 10 minit
6. Tableau de bord — okenn wòch pa dwe limen
7. Papye machin — tit dwe pwòp (Clean Title)
8. Istwa VIN — verifye ak Kapvoum ✓

**En English :**
1. Under vehicle — look for rust and water traces (flood)
2. Exhaust — no abnormal noises
3. Tires — minimum 40% tread life
4. Brakes — test at 60 km/h
5. Air conditioning — run for 10 minutes
6. Dashboard — no warning lights on
7. Documents — must have Clean Title
8. VIN history — verified with Kapvoum ✓

---

## 6. APIs EXTERNES — DÉTAILS D'INTÉGRATION

### NHTSA (gratuit, déjà intégré dans le frontend)

```javascript
// VIN Decode
GET https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/{VIN}?format=json

// Recalls
GET https://api.nhtsa.gov/recalls/recallsByVehicle?make={make}&model={model}&modelYear={year}
```

### ⚠️ VinAudit — ABANDONNÉ

VinAudit ne répond plus depuis ~1 an malgré inscription complète et plusieurs relances. Clé API jamais livrée. **Ne pas utiliser VinAudit.** Toute référence à VinAudit dans le code est à supprimer.

---

### Fournisseur VIN — Architecture couche d'abstraction

**Principe critique :** server.js ne doit JAMAIS appeler directement l'API d'un fournisseur. Toutes les requêtes passent par `providers/vinProvider.js` avec une interface normalisée. Si un fournisseur disparaît (comme VinAudit), on change une variable d'environnement — pas l'application.

#### Interface normalisée (format de sortie obligatoire pour tous les adaptateurs)

```javascript
{
  vin: "1NXBR32E85Z505904",
  decoded: { make, model, year, trim, engine, bodyType },
  title: { brands: [], salvage: false, lastTitleState, lastTitleDate },
  odometer: [{ reading, date, source }],
  accidents: [],
  recalls: [],
  provider: "clearvin",   // traçabilité — toujours inclure
  fetchedAt: "2026-08-06T..."
}
```

#### `providers/vinProvider.js` — Squelette

```javascript
const clearvin = require('./clearvin');
const vehicleDatabases = require('./vehicleDatabases');
const nhtsa = require('./nhtsa');

const ACTIVE_PROVIDER = process.env.VIN_PROVIDER || 'clearvin';

const providers = {
  clearvin: clearvin,
  vehicledatabases: vehicleDatabases,
  nhtsa: nhtsa,
};

async function getVehicleReport(vin) {
  const decoded = await nhtsa.decode(vin);
  const provider = providers[ACTIVE_PROVIDER];
  const history = await provider.getHistory(vin);
  return { vin, decoded, ...history, provider: ACTIVE_PROVIDER, fetchedAt: new Date().toISOString() };
}

module.exports = { getVehicleReport };
```

#### Changement de fournisseur = 1 ligne dans `.env`

```bash
VIN_PROVIDER=clearvin
# VIN_PROVIDER=vehicledatabases
```

---

### Fournisseur Phase 1 — ClearVin (choix principal)

```javascript
// Site : clearvin.com
// Statut : Fournisseur NMVTIS officiel (agréé gouvernement américain)
// Données : titre (Clean/Salvage/Rebuilt), flood damage, total loss,
//           odometer history, accidents, nombre de propriétaires
// Authentification : Bearer Token
// Coût estimé : ~$2.50 par rapport selon volume
// CLEARVIN_API_KEY → variable d'environnement

// ⚠️ AVANT INTÉGRATION — Confirmer par email :
// 1. "Are your title brands coming directly from NMVTIS?"
// 2. "Do you authorize AI summarization, custom scoring (/10),
//     and redistribution under our own branding in a PDF report?"
// 3. "Do you charge for failed/empty VIN lookups?"
// 4. "Please provide the exact NMVTIS disclaimer text we must include in our reports."
```

### Fournisseur Backup — Vehicle Databases

```javascript
// Site : vehicledatabases.com/portal
// Onboarding : 15 crédits gratuits sans CB
// Modèle : pay-as-you-go
// VEHICLE_DATABASES_API_KEY → variable d'environnement

GET https://api.vehicledatabases.com/vehicle-history/{VIN}
Headers: { "x-AuthKey": process.env.VEHICLE_DATABASES_API_KEY }
```

### Comparatif fournisseurs

| Fournisseur | Phase | Coût estimé | Points forts |
|---|---|---|---|
| **ClearVin** | **1 — Principal** | ~$2.50/rapport | NMVTIS officiel, données légales directes |
| Vehicle Databases | 1 — Backup/Test | Pay-as-you-go | 15 crédits gratuits, 25+ APIs |
| MarketCheck | 2 — V2 uniquement | $0.50-0.70/appel | Valeur marchande, prix marché |

### Positionnement NMVTIS vs Carfax (à intégrer dans le rapport PDF)

**Texte à inclure dans chaque rapport PDF :**
```
KR: "Rapò sa a baze sou done ofisyèl gouvènman ameriken an (NMVTIS).
     Pou yon machin ki koute plis pase $15,000, konsidere yon enspeksyon
     mekanik pwofesyonèl tou."

EN: "This report is based on official US government data (NMVTIS).
     For vehicles above $15,000, consider a professional mechanical
     inspection as well."
```

### Stripe

```javascript
// STRIPE_SECRET_KEY → variable d'environnement
// STRIPE_WEBHOOK_SECRET → variable d'environnement
// Prix : $14.99 USD
```

### MonCash (Digicel Haiti)

```javascript
// SDK : npm install moncash
// Sandbox : sandbox.moncashbutton.digicelgroup.com
// Production : htap002.digicelgroup.com
// Montant fixe : 2,500 HTG
// Compte : Kapvoum@AladinFlex (MonCash Antrepriz — activation en cours)
```

### Claude API (Anthropic)

```javascript
const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.ANTHROPIC_API_KEY,
    "anthropic-version": "2023-06-01"
  },
  body: JSON.stringify({
    model: "claude-sonnet-4-5", // vérifier le dernier identifiant disponible au moment du build
    max_tokens: 1000,
    system: `Tu es le conseiller automobile expert de Kapvoum pour la diaspora haïtienne.
    Tu reçois : (1) le JSON normalisé du rapport VIN, (2) le KapScore calculé, (3) l'Indice Haïti calculé.
    Génère UNIQUEMENT un JSON valide sans markdown :
    {
      "kapscore_justification_kr": string,
      "kapscore_justification_en": string,
      "indice_haiti_justification_kr": string,
      "top_risks_kr": [string, string, string],
      "top_risks_en": [string, string, string],
      "negotiation_tip_kr": string,
      "negotiation_tip_en": string,
      "verdict_kr": string,
      "verdict_en": string,
      "price_recommendation": number
    }
    Les scores sont déjà calculés — tu nuances et interprètes, tu ne recalcules pas.`,
    messages: [{ role: "user", content: JSON.stringify({ vinData: normalizedVinData, kapScore, indiceHaiti }) }]
  })
});
// Coût estimé : ~$0.02 par rapport
```

### Resend (email)

```javascript
// npm install resend
// RESEND_API_KEY → variable d'environnement
// Expéditeur : rapports@kapvoum.com
// Objet : "Rapò Kapvoum ou — {YEAR} {MAKE} {MODEL}"
// Pièce jointe : rapport_{VIN}_{timestamp}.pdf
```

### Supabase

```javascript
// SUPABASE_URL → variable d'environnement
// SUPABASE_ANON_KEY → variable d'environnement
// SUPABASE_SERVICE_KEY → variable d'environnement (backend uniquement)

// Tables à créer :
// orders: id (uuid), vin, email, name, payment_method, payment_id, amount, status, created_at
// reports: id (uuid), order_id (fk), vin, nhtsa_data (jsonb), provider_data (jsonb),
//          claude_output (jsonb), kapscore (float), indice_haiti (float), pdf_url, created_at
// vin_cache: vin (primary key), report_data (jsonb), created_at, expires_at
```

---

## 7. VARIABLES D'ENVIRONNEMENT REQUISES

Créer un fichier `.env` à la racine du projet (ne JAMAIS committer sur GitHub) :

```bash
VIN_PROVIDER=clearvin
CLEARVIN_API_KEY=your_key_here
VEHICLE_DATABASES_API_KEY=your_key_here

STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...

MONCASH_CLIENT_ID=your_client_id
MONCASH_CLIENT_SECRET=your_client_secret
MONCASH_MODE=sandbox

ANTHROPIC_API_KEY=sk-ant-...
RESEND_API_KEY=re_...

SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...

PORT=3000
NODE_ENV=production
APP_URL=https://kapvoum.aladinflex.com
```

Hostinger : ajouter ces variables dans hPanel → kapvoum.aladinflex.com → Environment Variables.

---

## 8. STRUCTURE DU PROJET CIBLE

```
Kapvoum/
├── index.html              ← Frontend complet (déjà en prod, NE PAS TOUCHER sans raison)
├── server.js               ← À remplacer par la version complète avec Express
├── package.json            ← À mettre à jour avec les dépendances
├── .env                    ← Variables d'environnement (ne pas committer)
├── .gitignore              ← Inclure .env, node_modules
├── providers/
│   ├── vinProvider.js
│   ├── nhtsa.js
│   ├── clearvin.js
│   └── vehicleDatabases.js
├── routes/
│   ├── vin.js
│   ├── payment.js
│   └── report.js
├── services/
│   ├── claude.js
│   ├── pdf.js
│   ├── email.js
│   └── supabase.js
├── utils/
│   ├── score.js             ← KapScore + Indice Haïti (règles fixes — JAMAIS via Claude)
│   └── validate.js           ← Validation VIN + checksum 9ème caractère
└── templates/
    └── report-template.js
```

---

## 9. PACKAGE.JSON CIBLE

```json
{
  "name": "kapvoum",
  "version": "2.0.0",
  "description": "Vehicle History Platform for Haiti",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "dotenv": "^16.3.1",
    "pdfkit": "^0.14.0",
    "resend": "^2.0.0",
    "@supabase/supabase-js": "^2.38.4",
    "stripe": "^14.5.0",
    "moncash": "^1.0.0",
    "node-fetch": "^3.3.2",
    "cors": "^2.8.5",
    "express-rate-limit": "^7.1.5"
  }
}
```

---

## 10. CE QUI RESTE À FAIRE — LISTE PRIORITAIRE

### Priorité 0 — Sélection fournisseur VIN (avant tout développement backend)

- [ ] Créer compte ClearVin (clearvin.com) + envoyer les 5 questions par email
- [ ] Créer compte Vehicle Databases (vehicledatabases.com/portal) — 15 crédits gratuits sans CB
- [ ] Script Node.js de test : comparer les payloads JSON des 2 fournisseurs
- [ ] Calculer coût total réel par rapport complet
- [ ] Choisir le fournisseur principal + configurer `VIN_PROVIDER` dans `.env`

### Priorité 1 — Backend core (bloquant pour la vente)

- [ ] Implémenter `providers/nhtsa.js` (gratuit, sans clé)
- [ ] Implémenter `providers/clearvin.js` + `providers/vehicleDatabases.js` + `providers/vinProvider.js`
- [ ] Remplacer server.js minimal par Express avec routes complètes
- [ ] Valider VIN côté backend (regex + checksum) AVANT appel API payant
- [ ] Implémenter `utils/score.js` — KapScore + Indice Haïti
- [ ] Intégrer Claude API pour justifications et résumé
- [ ] Générer PDF avec PDFKit
- [ ] Intégrer Resend pour envoi email
- [ ] Créer tables Supabase (orders, reports, vin_cache)
- [ ] Connecter Stripe
- [ ] Activer MonCash Antrepriz
- [ ] Implémenter cache VIN dans Supabase

### Priorité 2 — Sécurité et fiabilité

- [ ] Rate limiting (express-rate-limit)
- [ ] Validation VIN + checksum
- [ ] Paiement AVANT appel fournisseur VIN
- [ ] Ne pas facturer les lookups 404/vides
- [ ] Variables d'environnement sur Hostinger
- [ ] .gitignore (exclure .env et node_modules)
- [ ] Disclaimer NMVTIS obligatoire dans chaque PDF

### Priorité 3 — Infrastructure

- [ ] Reconnecter GitHub (aladinflexstudio) → Hostinger auto-deployment
- [ ] Pointer kapvoum.com → kapvoum.aladinflex.com
- [ ] Configurer domaine email rapports@kapvoum.com

### Priorité 4 — Amélioration produit / branding

- [ ] Remplacer "Score Kapvoum" par **KapScore** partout dans index.html
- [ ] Ajouter **Indice Haïti** dans la vue rapport du frontend
- [ ] Mettre à jour le slogan
- [ ] Carte preview dynamique
- [ ] Numéro MonCash réel dans le formulaire
- [ ] Numéro WhatsApp support réel

---

## 11. PIÈGES NMVTIS — À LIRE IMPÉRATIVEMENT

### Piège 1 — "Vehicle History" ≠ NMVTIS automatiquement
Toujours demander explicitement : **"Are your title brands coming directly from NMVTIS?"**

### Piège 2 — Facturation des lookups vides
Valider le VIN avec checksum AVANT tout appel payant. Choisir un fournisseur qui ne facture pas les 404.

### Piège 3 — Coûts cachés multi-endpoints
Calculer le coût TOTAL d'un rapport complet, pas le coût d'un seul endpoint.

### Piège 4 — NMVTIS ≠ Carfax
Ne jamais promettre un historique complet type Carfax — être transparent = crédibilité.

### Piège 5 — Disclaimer NMVTIS obligatoire
Demander le texte exact au fournisseur et l'inclure dans chaque PDF.

### Piège 6 — Licence de redistribution
Confirmer par écrit que Kapvoum est autorisé à générer un PDF personnalisé, appliquer un score /10, faire un résumé IA.

---

## 12. NOTES IMPORTANTES POUR LE DÉVELOPPEUR

### Exclusions délibérées (décidées après revue critique du positionnement, août 2026)

Ces éléments ont été envisagés puis explicitement écartés — ne pas les réintroduire sans revalider :

- **PAS de "™"** sur KapScore ou Indice Haïti — aucune marque n'est réellement déposée, le symbole donnerait une fausse impression de protection légale.
- **PAS de scores multiples** (Historique / Fiabilité / Qualité-prix séparés) — contredit la promesse de simplicité face aux 15 pages de Carfax. Un seul KapScore + un seul Indice Haïti, point final.
- **PAS de conseils de négociation avec un chiffre précis** (ex: "vann pou $8,200") — aucune donnée de marché fiable ne soutient un prix exact ; risque juridique si le chiffre est faux et que l'acheteur perd de l'argent en s'y fiant. Une fourchette qualitative ("negosye, pa peye plis pase pri mache") est acceptable, un chiffre inventé ne l'est pas.
- **PAS d'estimation de coûts de réparation futurs** (ex: "transmission ≈ $2,300") — même raison : pas de données de fiabilité réelles par modèle pour soutenir ces chiffres avec autorité.

### KapScore et Indice Haïti — Règles absolues
- **TOUJOURS écrire KapScore et Indice Haïti** — pas "Score Kapvoum" ni "Score /10" générique
- Calculés dans `utils/score.js` par des règles fixes AVANT l'appel Claude API
- Claude nuance et interprète — il ne recalcule JAMAIS les scores

### ⭐ Règle absolue — Couche providers
**Ne jamais appeler une API fournisseur VIN directement depuis server.js ou les routes.** Toujours passer par `providers/vinProvider.js`.

### Ce qu'il NE FAUT PAS changer dans index.html sans raison
- Le design et les couleurs (palette crème/or/noir validée)
- La logique de toggle KR/EN
- Les appels NHTSA (déjà fonctionnels)
- La structure des 4 vues

### Contraintes techniques spécifiques à Hostinger
- Node.js 22.x
- Le point d'entrée doit s'appeler `server.js`
- Variables d'environnement configurées dans hPanel
- Pas besoin de Redis/BullMQ pour le MVP

### MonCash — Réalité terrain
Webhooks potentiellement instables. Validation manuelle + Google Sheet pour le MVP — ne pas sur-automatiser avant validation du marché.

### Langue
Tous les textes côté utilisateur doivent exister en Kreyòl ET en English. Toggle instantané, pattern `data-kr` / `data-en` déjà en place dans index.html.

---

## 13. CONTACTS ET ACCÈS

| Service | Statut | Notes |
|---|---|---|
| Hostinger Business | ✅ Actif | hpanel.hostinger.com |
| GitHub aladinflexstudio | ✅ Actif | github.com/aladinflexstudio |
| kapvoum.aladinflex.com | ✅ Live (frontend statique seulement) | Déployé 12 avril 2026 |
| kapvoum.com | ✅ Possédé | À pointer vers le subdomain |
| VinAudit API | ❌ Abandonné | Pas de réponse depuis ~1 an |
| ClearVin | ⏳ À créer | clearvin.com — PRIORITÉ #1 |
| Vehicle Databases | ⏳ À créer | vehicledatabases.com — 15 crédits gratuits |
| MonCash Antrepriz | ⏳ En attente | Code PIN activation |
| Supabase | ⏳ À créer | Free tier suffisant pour MVP |
| Stripe | ⏳ À connecter | Compte à créer/configurer |
| Resend | ⏳ À connecter | Compte à créer |
| Claude API | ⏳ À connecter | Clé API Anthropic à créer |

---

## 14. VISION LONG TERME (POST-MVP)

- Packs de rapports B2B pour courtiers/importateurs haïtiens
- Abonnement dealers haïtiens
- MarketCheck intégration (V2) — estimation valeur marchande
- Scores multiples V2 — KapScore Historique + Fiabilité + Indice Haïti + Qualité-Prix
- Estimation coûts futurs V2
- API Kapvoum (B2B)
- Partenariats garages/inspecteurs certifiés Haïti
- Extension République Dominicaine, Jamaïque
- Application mobile (React Native) — phase 3

---

*Document préparé par AladinFlex LLC — Rockville, Maryland*
*Kapvoum@AladinFlex — github.com/aladinflexstudio/Kapvoum*

# HCC Dashboard — SvelteKit + Flask

Application web de gestion pour le **Hockey Club de Chartres (HCC)**.  
Interface d'administration permettant aux membres de suivre les matchs, les actualités et la gestion des adhérents.

---

## Description du projet

Le projet est divisé en deux parties indépendantes :

| Partie | Technologie | Rôle |
|--------|------------|------|
| **Front-end** | SvelteKit 2 + Svelte 5 | Interface utilisateur, authentification, tableau de bord |
| **Back-end** | Flask 3 (REST API) | Source de vérité métier, gestion des adhérents, matchs, actualités |

### API choisie — Flask REST

L'API Flask a été développée from scratch dans le cadre du cours. Elle expose des endpoints REST organisés par domaine :

- `/api/auth` — inscription, connexion, refresh token, déconnexion
- `/api/adherents` — CRUD adhérents, validation de comptes, gestion des rôles
- `/api/matchs` — CRUD matchs, inscription/désinscription d'un joueur
- `/api/news` — CRUD actualités

L'authentification repose sur **JWT** (Flask-JWT-Extended) avec un access token (1h) et un refresh token (2h).

Le front-end SvelteKit utilise cette API comme **source de vérité** : à la connexion, il interroge Flask en premier, puis synchronise l'utilisateur dans sa propre base via **Better Auth**.

---

## Stack technique

**Front-end**
- [SvelteKit 2](https://kit.svelte.dev) + [Svelte 5](https://svelte.dev) (runes)
- TypeScript
- TailwindCSS 4
- Better Auth — gestion des sessions côté SvelteKit
- Prisma 7 + PostgreSQL (Neon) — base de données SvelteKit
- `@prisma/adapter-pg` — driver PostgreSQL pour Prisma 7

**Back-end**
- Flask 3 + Flask-SQLAlchemy
- Flask-JWT-Extended
- Flask-Marshmallow — sérialisation/validation
- Flask-Bcrypt — hashage des mots de passe
- PostgreSQL (Neon) — base de données Flask
- Gunicorn — serveur de production
- Docker — conteneurisation

**Déploiement**
- Front-end → [Vercel](https://vercel.com)
- Back-end → [Render](https://render.com) (Docker)
- Bases de données → [Neon](https://neon.tech) (PostgreSQL serverless)

---

## Lancer le projet en local

### Prérequis

- Node.js 24+
- Python 3.12+
- Docker & Docker Compose

### 1. Back-end Flask

```bash
cd hcc-flask-render

# Copier le fichier d'environnement
cp .env.example .env.production
# Renseigner DATABASE_URL, JWT_SECRET_KEY, FLASK_ENV=development

# Lancer avec Docker Compose
docker compose up --build

# L'API est disponible sur http://localhost:5000
```

Pour initialiser la base (première fois uniquement) :

```bash
# Ajouter INIT_DB=true dans .env.production, relancer, puis le retirer
```

### 2. Front-end SvelteKit

```bash
cd hcc-sveltekit-v2

npm install
```

Créer un fichier `.env` :

```env
PUBLIC_API_URL=http://localhost:5000
BETTER_AUTH_URL=http://localhost:5173
BETTER_AUTH_SECRET=une-cle-secrete-longue
JWT_SECRET=une-cle-jwt
DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require
```

```bash
# Créer les tables
npx prisma migrate dev --name "init"

# Lancer le serveur de développement
npm run dev
# → http://localhost:5173
```

### Comptes de test

Tous les comptes utilisent le mot de passe : **`1234567890`**

**Comptes actifs**

| Email | Rôle | Accès |
|-------|------|-------|
| `kouassiconstant94@gmail.com` | `admin` | Tout (adhérents, validation, matchs, news) |
| `jean13@liveee.fr` | `coach` | Adhérents, matchs (création), news |
| `jean13@live.fr` | `contributor` | News (création/suppression) |
| `jean13@livee.fr` | `player` | Matchs (inscription), news |

**Comptes en attente de validation** (bloqués à la connexion tant qu'un admin ne les valide pas)

| Email | Rôle |
|-------|------|
| `lucas.martin@hcc.fr` | `pending` |
| `emma.bernard@hcc.fr` | `pending` |
| `jules.petit@hcc.fr` | `pending` |
| `lea.robert@hcc.fr` | `pending` |
| `nathan.moreau@hcc.fr` | `pending` |

---

### Streaming SvelteKit + résolution de Promise dans $state

Dans ce projet, les pages `matchs`, `news` et `adherents` utilisent le **streaming SvelteKit** :
le serveur retourne une `Promise` sans l'attendre, ce qui permet au HTML d'être envoyé immédiatement
(squelette de chargement), puis les données arrivent en arrière-plan.

```ts
// +page.server.ts — retourner la Promise directement (sans await)
export const load: PageServerLoad = ({ locals, setHeaders }) => {
  const token = (locals.user as Record<string, unknown>)?.flask_access_token as string;

  setHeaders({ 'cache-control': 'private, max-age=60' });

  return {
    matchs: flaskGet<Match[]>('/api/matchs/', token), // Promise non résolue
  };
};
```

```svelte
<!-- +page.svelte — résoudre la Promise dans $state pour permettre les mutations -->
<script lang="ts">
  let { data } = $props();

  let matchs     = $state<Match[]>([]);
  let dataLoaded = $state(false);

  // Promise.resolve() fonctionne que data.matchs soit déjà résolu ou non
  $effect(() => {
    Promise.resolve(data.matchs).then(m => {
      matchs = m ?? [];
      dataLoaded = true;
    });
  });

  // Les mutations fonctionnent normalement sur $state
  async function createMatch() {
    const res = await matchsApi.create(form);
    if (res.data) matchs = [res.data, ...matchs]; // mutation directe
  }
</script>

{#if !dataLoaded}
  <!-- Squelette pendant le chargement -->
  {#each Array(5) as _}
    <div class="h-20 bg-gray-50 rounded-2xl animate-pulse"></div>
  {/each}
{:else}
  <!-- Contenu réel -->
  {#each matchs as match}...{/each}
{/if}
```

> **Pourquoi ce pattern ?**  
> `{#await}` natif de Svelte ne permet pas d'utiliser `$state`/`$derived` à l'intérieur du bloc.  
> Le pattern `$effect` + `$state` résout ce problème tout en conservant la capacité de muter les données localement (ajout/suppression d'éléments sans rechargement de page).

---

### Composants réutilisables du projet

| Composant | Rôle |
|-----------|------|
| `src/lib/components/ui/Pagination.svelte` | Barre de pagination avec ellipsis |
| `src/lib/components/dashboard/StatCard.svelte` | Carte de statistique (dashboard) |
| `src/lib/components/layout/Sidebar.svelte` | Navigation latérale responsive |
| `src/lib/components/layout/Topbar.svelte` | Barre supérieure avec slot pour actions |

---

## Structure des fichiers

### Front-end (`src/`)

```
src/
├── hooks.server.ts              # Middleware global : session, refresh token Flask, redirections
├── app.d.ts                     # Types globaux (locals.user, locals.session)
│
├── lib/
│   ├── api/
│   │   ├── client.ts            # Client HTTP vers Flask (gestion JWT, retry 401)
│   │   └── index.ts             # API par domaine : adherentsApi, matchsApi, newsApi
│   ├── server/
│   │   ├── auth.ts              # Configuration Better Auth
│   │   ├── flask.ts             # flaskGet() — requêtes SSR vers Flask
│   │   └── prisma.ts            # Singleton PrismaClient (adapté HMR dev)
│   ├── components/
│   │   ├── ui/
│   │   │   └── Pagination.svelte  # Pagination réutilisable
│   │   ├── dashboard/
│   │   │   └── StatCard.svelte    # Carte de statistique
│   │   └── layout/
│   │       ├── Sidebar.svelte     # Navigation latérale
│   │       └── Topbar.svelte      # Barre supérieure
│   ├── stores/
│   │   └── user.ts              # Store Svelte pour l'utilisateur connecté
│   └── types/
│       └── index.ts             # Types TypeScript partagés
│
└── routes/
    ├── +page.svelte             # Page d'accueil → redirige vers /dashboard
    ├── auth/
    │   ├── login/               # Connexion (Flask + Better Auth)
    │   └── register/            # Inscription
    ├── dashboard/
    │   ├── +layout.svelte       # Layout commun (Sidebar + contenu)
    │   ├── +layout.server.ts    # Charge user/session dans les pages filles
    │   ├── +page.svelte         # Vue d'ensemble (stats, matchs récents, actualités)
    │   ├── adherents/
    │   │   ├── +page.svelte     # Liste filtrée + pagination (streaming)
    │   │   └── [id]/            # Détail d'un adhérent
    │   ├── matchs/
    │   │   ├── +page.svelte     # Liste unifiée + filtres + pagination (streaming)
    │   │   └── [id]/            # Détail d'un match + inscription
    │   ├── news/
    │   │   ├── +page.svelte     # Grille + recherche + pagination (streaming)
    │   │   └── [id]/            # Détail d'une actualité
    │   ├── pending/             # Adhérents en attente de validation (admin)
    │   └── profile/             # Profil utilisateur connecté
    └── api/
        ├── auth/[...all]/       # Proxy Better Auth
        ├── session/token/       # Renvoie le token Flask frais (bypass cookie cache)
        └── admin/sync-user/     # Synchronisation rôle Flask → Neon
```

### Back-end (`app/`)

```
app/
├── app.py                 # Factory Flask (create_app), CORS, blueprints
├── config.py              # Config dev/prod (DATABASE_URL, JWT_SECRET_KEY)
├── extensions.py          # Instances partagées : db, jwt, ma, bcrypt
├── seeder.py              # Données initiales : rôles, admin par défaut
├── requirements.txt       # Dépendances Python
│
└── api/
    ├── auth/
    │   ├── routes.py      # POST /register, /login, /refresh, /logout
    │   └── services.py    # Logique métier auth
    ├── adherents/
    │   ├── models.py      # Adherent, Role, Permission (SQLAlchemy)
    │   ├── routes.py      # GET/PUT adherents, PATCH validate
    │   ├── services.py    # Logique métier adhérents
    │   └── schemas.py     # Marshmallow : validation + sérialisation
    ├── matchs/
    │   ├── models.py      # Match, Registration
    │   ├── routes.py      # CRUD matchs, POST subscription, DELETE unsubscribe
    │   ├── services.py
    │   └── schemas.py
    └── news/
        ├── models.py      # News
        ├── routes.py      # CRUD actualités
        ├── services.py
        └── schemas.py
```

---

## Fonctionnalités implémentées

### Authentification
- [x] Connexion via Flask (source de vérité) avec synchronisation automatique dans Better Auth
- [x] Connexion Better Auth seul (pour les comptes créés directement dans SvelteKit)
- [x] Protection des routes par middleware (`hooks.server.ts`)
- [x] Redirection automatique : connecté → dashboard, non connecté → login
- [x] Rafraîchissement automatique du token Flask (access + refresh) côté SSR et client
- [x] Blocage des comptes en attente de validation (`role === 'pending'`)

### Adhérents
- [x] Liste filtrée par rôle + recherche + pagination (admin/coach)
- [x] Détail d'un adhérent
- [x] Liste des comptes en attente de validation
- [x] Validation d'un adhérent avec attribution de rôle (admin uniquement)
- [x] Inscription d'un nouvel adhérent

### Matchs
- [x] Liste unifiée avec filtres (Tous / À venir / Terminés) + pagination
- [x] Détail d'un match (lieu, date, commentaire, score)
- [x] Création d'un match (coach/admin)
- [x] Modification d'un match (coach/admin)
- [x] Inscription / désinscription d'un joueur à un match

### Actualités
- [x] Liste avec recherche + filtre auteur + pagination
- [x] Détail d'une actualité
- [x] Création d'une actualité (coach/admin/contributor)
- [x] Suppression d'une actualité (auteur ou admin)

### Interface & Performance
- [x] Dashboard avec statistiques (adhérents, matchs, actualités, comptes en attente)
- [x] Prochain match mis en avant sur le dashboard
- [x] Sidebar responsive avec navigation par rôle
- [x] Squelettes de chargement animés (skeleton screens)
- [x] Streaming SvelteKit : pages rendues instantanément, données chargées en arrière-plan
- [x] Cache navigateur 60s (`cache-control: private, max-age=60`) sur toutes les pages dashboard
- [x] Chargement parallèle des données Flask (`Promise.all`) sur le dashboard home

### Routes par rôle

| Route | Admin | Coach | Player | Contributor |
|-------|-------|-------|--------|-------------|
| /dashboard | ✅ | ✅ | ✅ | ✅ |
| /dashboard/adherents | ✅ | ✅ | ❌ | ❌ |
| /dashboard/pending | ✅ | ❌ | ❌ | ❌ |
| /dashboard/matchs | ✅ | ✅ | ✅ | ❌ |
| /dashboard/news | ✅ | ✅ | ✅ | ✅ |
| /dashboard/profile | ✅ | ✅ | ✅ | ✅ |

---

## Fonctionnalités manquantes

- [ ] **Réinitialisation du mot de passe** — aucun flux "mot de passe oublié" n'est implémenté
- [ ] **Vérification d'email** — les comptes sont créés sans confirmation par email
- [ ] **Upload d'image** — pas de photo de profil ni d'image pour les actualités
- [ ] **Graphiques** — Chart.js est installé mais les graphiques ne sont pas implémentés
- [ ] **Notifications en temps réel** — les mises à jour nécessitent un rechargement manuel
- [ ] **Saisie du score** — le champ `score` existe en base mais l'interface de saisie manque
- [ ] **Tests** — aucun test unitaire ou d'intégration n'a été écrit

---

## Difficultés rencontrées et solutions

### 1. Double système d'authentification (Flask + Better Auth)

**Problème** : Flask est la source de vérité des utilisateurs, mais SvelteKit a besoin de ses propres sessions (cookies, `locals.user`) pour protéger les routes côté serveur.

**Solution** : À la connexion, le front interroge Flask en premier. Si Flask valide, on fait un `upsert` dans Better Auth (création au premier login, mise à jour sinon). Les tokens Flask sont stockés dans la table `user` de Neon et renvoyés au client via un endpoint SvelteKit dédié (`/api/session/token`). En cas d'expiration (401), le client refait un refresh automatiquement avant de rejouer la requête.

---

### 2. Token Flask expiré malgré une session active (cookie cache Better Auth)

**Problème** : Better Auth stocke les données utilisateur dans le cookie de session avec un TTL de 2h (`cookieCache`). Si le token Flask expire entre deux visites, `getSession()` retourne le cookie (stale) — Flask renvoie 401 silencieusement et la page s'affiche vide.

**Solution** : Dans `hooks.server.ts`, contournement du cookie cache via une lecture directe Prisma. Si l'access token est expiré (avec 60s de marge), appel Flask `/api/auth/refresh` et injection du nouveau token dans `locals.user`. L'update Prisma est en best-effort (wrapped dans son propre try/catch) pour ne pas bloquer si la base est temporairement indisponible.

---

### 3. Migration SQLite → PostgreSQL (Prisma 7)

**Problème** : Vercel n'a pas de système de fichiers persistant — SQLite est incompatible avec un déploiement serverless. De plus, Prisma 7 a supprimé le champ `url` dans `schema.prisma` (breaking change par rapport à Prisma 6).

**Solution** :
- Suppression de `url = env("DATABASE_URL")` dans le bloc `datasource db`
- Déplacement de l'URL de connexion dans `prisma.config.ts`
- Remplacement de `@prisma/adapter-better-sqlite3` par `@prisma/adapter-pg`
- Suppression du dossier `prisma/migrations/` (historique SQLite incompatible avec PostgreSQL) et re-migration depuis zéro avec `prisma migrate dev --name "init"`

---

```ts
const g = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = g.prisma ?? createClient();
if (process.env.NODE_ENV !== 'production') g.prisma = prisma;
```

---

### 4. Variables d'environnement publiques sur Vercel

**Problème** : Le client API utilisait `import.meta.env.PUBLIC_API_URL` qui n'était pas résolu correctement par Vercel → fallback systématique sur `localhost:5000` en production.

**Solution** : Remplacement par l'import SvelteKit officiel :
```typescript
// Avant
const BASE = import.meta.env.PUBLIC_API_URL ?? 'http://localhost:5000';

// Après
import { PUBLIC_API_URL } from '$env/static/public';
const BASE = PUBLIC_API_URL;
```
`$env/static/public` est injecté au moment du build par le plugin Vite de SvelteKit, ce qui garantit la bonne valeur en production.

---

### 5. Connexion à la base de données Flask sur Render

**Problème** : La variable `DATABASE_URL` du service Flask utilisait l'URL **interne** Render (`dpg-xxx-a`) qui ne se résout pas depuis un container Docker — erreur `Name or service not known`.

**Solution** : Utilisation de l'**External URL** de Neon (hostname complet `ep-xxx.eu-west-2.aws.neon.tech`) qui fonctionne depuis n'importe quel environnement, y compris Docker sur Render.

---

## Déploiement

| Service | URL |
|---------|-----|
| Front-end | https://hcc-sveltekit.vercel.app |
| Back-end | https://hcc-flask.onrender.com |

> **Note** : Le back-end est hébergé sur Render en plan gratuit. Il peut mettre jusqu'à 60 secondes à répondre après une période d'inactivité (cold start).

---

## Auteur

Constant KOUASSI  
Projet réalisé dans le cadre du cours **Développement API**

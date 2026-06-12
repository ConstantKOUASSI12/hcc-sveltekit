# HCC — Handball Club de Comines · Frontend

SvelteKit + TypeScript + Tailwind CSS

## Stack
- **SvelteKit** — framework fullstack
- **TypeScript** — typage statique
- **Tailwind CSS** — styling utility-first
- **Better Auth** — gestion de l'authentification

## Lancement

```bash
npm install
npm run dev
# → http://localhost:5173
```

## Variables d'environnement

```bash
# .env
PUBLIC_API_URL=http://localhost:5000   # URL de ton API Flask
BETTER_AUTH_SECRET=your-secret
BETTER_AUTH_URL=http://localhost:5173
```

## Structure

```
src/
├── lib/
│   ├── api/          ← client HTTP + endpoints
│   ├── components/   ← composants réutilisables
│   ├── stores/       ← état global (auth)
│   └── types/        ← interfaces TypeScript
└── routes/
    ├── auth/
    │   ├── login/    ← page de connexion
    │   └── register/ ← page d'inscription
    └── dashboard/
        ├── +page.svelte       ← vue d'ensemble
        ├── adherents/         ← liste adhérents (admin/coach)
        ├── pending/           ← validation adhérents (admin)
        ├── matchs/            ← liste + détail matchs
        ├── news/              ← actualités
        └── profile/           ← profil personnel
```

## Routes par rôle

| Route | Admin | Coach | Player | Contributor |
|-------|-------|-------|--------|-------------|
| /dashboard | ✅ | ✅ | ✅ | ✅ |
| /dashboard/adherents | ✅ | ✅ | ❌ | ❌ |
| /dashboard/pending | ✅ | ❌ | ❌ | ❌ |
| /dashboard/matchs | ✅ | ✅ | ✅ | ❌ |
| /dashboard/news | ✅ | ✅ | ✅ | ✅ |
| /dashboard/profile | ✅ | ✅ | ✅ | ✅ |

## Comptes de test

```
admin@hcc.com    / Admin@123456
coach@hcc.com    / Coach@123456
player@hcc.com   / Player@123456
contrib@hcc.com  / Contrib@123456
```

## Docker

```bash
# Avec ton API Flask
docker compose up -d
```

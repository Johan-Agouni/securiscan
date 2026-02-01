# SecuriScan

Plateforme SaaS de monitoring de securite web. Scannez vos sites, detectez les vulnerabilites, recevez des alertes en temps reel.

Full-stack security monitoring SaaS platform built with Next.js, Express, PostgreSQL, Redis, and Stripe.

## Fonctionnalites

### Scanner de Securite
- **Headers HTTP** - Analyse des en-tetes de securite (HSTS, CSP, X-Frame-Options, etc.)
- **SSL/TLS** - Validation du certificat, expiration, version du protocole
- **OWASP** - Cookies securises, disclosure d'informations, methodes HTTP, mixed content
- **Performance** - Temps de reponse (TTFB), code HTTP, taille, compression

### Plateforme SaaS
- **Authentification JWT** - Access + refresh tokens avec rotation
- **Multi-sites** - Surveillez plusieurs sites depuis un dashboard unique
- **Score de securite** - Note de 0 a 100 avec grade A-F
- **Alertes email** - Notifications automatiques si score critique ou chute de score
- **Plans tarifaires** - Free / Pro / Business avec Stripe
- **Dashboard admin** - Gestion des utilisateurs et statistiques
- **Mode sombre** - Basculement instantane jour/nuit

### Rapport PDF exportable
- Export PDF complet des resultats de scan avec score, grade et recommandations
- Generation serveur via PDFKit avec graphiques et mise en page professionnelle
- Telechargement direct depuis la page de detail d'un scan

### Scans programmes
- Planification automatique : quotidien, hebdomadaire ou mensuel
- Jobs BullMQ avec cron patterns (execution a 2h du matin)
- Restauration automatique des schedules au redemarrage du serveur
- Configuration par site depuis le dashboard

### Notifications email avancees
- Notification de fin de scan avec resume des resultats
- Alerte automatique si score < 50, resultats critiques, ou chute de score >= 10 points
- Templates HTML responsives

### Edition de site
- Modal d'edition pour modifier le nom et le statut actif/inactif d'un site
- Mise a jour en temps reel depuis la page de detail du site

## Stack Technique

| Couche | Technologies |
|--------|-------------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS, Recharts |
| Backend | Node.js, Express, TypeScript, Zod |
| Base de donnees | PostgreSQL 16, Prisma ORM |
| Queue | BullMQ, Redis 7 |
| Auth | JWT (access + refresh), bcrypt |
| Paiement | Stripe (checkout, webhooks, portal) |
| Email | Nodemailer |
| PDF | PDFKit |
| Tests | Jest, Supertest, Vitest, React Testing Library |
| DevOps | Docker, Docker Compose, GitHub Actions |
| Deploiement | Vercel (client) + Railway (serveur) |

## Architecture

```
securiscan/
├── client/                 # Frontend Next.js (App Router)
│   ├── src/
│   │   ├── app/            # Pages (SSR landing + SPA dashboard)
│   │   ├── components/     # Composants React reutilisables
│   │   ├── context/        # AuthContext, ToastContext
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # API client, utils, constantes
│   │   └── types/          # TypeScript interfaces
│   └── Dockerfile
│
├── server/                 # Backend Express API
│   ├── prisma/             # Schema + migrations + seed
│   ├── src/
│   │   ├── config/         # DB, Redis, Queue, Stripe, Email
│   │   ├── middleware/     # Auth, validation, rate limiting
│   │   ├── modules/        # Feature modules
│   │   │   ├── auth/       # Authentification JWT
│   │   │   ├── sites/      # CRUD sites monitores
│   │   │   ├── scans/      # Declenchement + historique + PDF
│   │   │   ├── scanner/    # Engine de scan (BullMQ worker)
│   │   │   │   ├── checks/ # Headers, SSL, OWASP, Performance
│   │   │   │   └── scheduler.service.ts # Scans programmes
│   │   │   ├── payments/   # Stripe integration
│   │   │   ├── admin/      # Administration
│   │   │   └── notifications/ # Emails transactionnels
│   │   └── utils/          # Logger, JWT, hashing, errors
│   └── Dockerfile
│
├── docker-compose.yml      # PostgreSQL + Redis + API + Client
└── .github/workflows/      # CI/CD GitHub Actions
```

## Demarrage rapide

### Prerequis
- Node.js >= 20
- PostgreSQL 16+
- Redis 7+
- (ou Docker)

### Avec Docker (recommande)

```bash
git clone https://github.com/Johan-Agouni/securiscan.git
cd securiscan
cp .env.example .env
docker-compose up -d
```

### Installation manuelle

```bash
# Cloner le projet
git clone https://github.com/Johan-Agouni/securiscan.git
cd securiscan

# Installer les dependances
npm install

# Configurer l'environnement
cp server/.env.example server/.env
cp client/.env.local.example client/.env.local

# Lancer PostgreSQL et Redis (Docker)
docker-compose up -d postgres redis

# Appliquer les migrations
cd server && npx prisma migrate dev && cd ..

# Seeder la base de donnees
npm run seed -w server

# Lancer en developpement
npm run dev
```

### Acces

| Service | URL |
|---------|-----|
| Client | http://localhost:3000 |
| API | http://localhost:4000 |
| Health Check | http://localhost:4000/api/health |

### Comptes de demonstration

| Role | Email | Mot de passe |
|------|-------|-------------|
| Admin | admin@securiscan.dev | Admin123! |
| Pro | demo@securiscan.dev | Demo123! |
| Free | free@securiscan.dev | Free123! |

## API Endpoints

### Authentification
| Methode | Endpoint | Description |
|---------|----------|-------------|
| POST | /api/auth/register | Inscription |
| POST | /api/auth/login | Connexion |
| POST | /api/auth/refresh | Rafraichir le token |
| POST | /api/auth/logout | Deconnexion |
| POST | /api/auth/forgot-password | Mot de passe oublie |
| POST | /api/auth/reset-password | Reinitialiser le mot de passe |
| GET | /api/auth/verify-email/:token | Verifier l'email |
| GET | /api/auth/me | Profil utilisateur |

### Sites
| Methode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/sites | Liste des sites |
| POST | /api/sites | Ajouter un site |
| GET | /api/sites/:siteId | Detail d'un site |
| PUT | /api/sites/:siteId | Modifier un site |
| DELETE | /api/sites/:siteId | Supprimer un site |
| PUT | /api/sites/:siteId/schedule | Configurer le scan programme |

### Scans
| Methode | Endpoint | Description |
|---------|----------|-------------|
| POST | /api/scans/trigger/:siteId | Lancer un scan |
| GET | /api/scans/site/:siteId | Historique des scans |
| GET | /api/scans/:scanId | Detail d'un scan |
| GET | /api/scans/:scanId/results | Resultats du scan |
| GET | /api/scans/:scanId/report/pdf | Telecharger le rapport PDF |

### Paiements
| Methode | Endpoint | Description |
|---------|----------|-------------|
| POST | /api/payments/checkout | Creer une session Stripe |
| POST | /api/payments/webhook | Webhook Stripe |
| POST | /api/payments/portal | Portail de facturation |
| GET | /api/payments/history | Historique des paiements |

### Admin
| Methode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/admin/stats | Statistiques systeme |
| GET | /api/admin/users | Liste des utilisateurs |
| GET | /api/admin/users/:userId | Detail utilisateur |
| PATCH | /api/admin/users/:userId | Modifier un utilisateur |
| GET | /api/admin/scans | Scans recents |

## Scanner de Securite

Le scanner analyse 4 categories avec un score pondere :

| Categorie | Poids | Checks |
|-----------|-------|--------|
| Headers HTTP | 30% | HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, X-Powered-By, Server |
| SSL/TLS | 30% | Certificat valide, expiration, version TLS, redirection HTTP→HTTPS |
| OWASP | 25% | Cookies securises, disclosure d'informations, methodes HTTP, mixed content |
| Performance | 15% | TTFB, code HTTP, taille de reponse, compression |

**Score** : 0-100 → Grade A (90+) / B (80+) / C (65+) / D (50+) / F (<50)

## Plans

| Fonctionnalite | Free | Pro (9.99€/mois) | Business (29.99€/mois) |
|---------------|------|-------------------|----------------------|
| Sites monitores | 2 | 10 | 50 |
| Scans par jour | 5 | 50 | Illimite |
| Historique | 7 jours | 90 jours | 1 an |
| Alertes email | Non | Oui | Oui |
| Scans programmes | Non | Oui | Oui |
| Rapport PDF | Non | Oui | Oui |
| Support | - | Standard | Prioritaire |

## Tests

```bash
# Tous les tests
npm test

# Tests serveur avec couverture
npm test --workspace=server

# Tests client
npm test --workspace=client
```

## Securite

- Helmet avec Content Security Policy
- Rate limiting adaptatif (global + auth + scans)
- JWT access token (15 min) + refresh token rotation (7 jours)
- Validation Zod sur toutes les entrees
- Hashing bcrypt (12 rounds)
- Protection HPP
- Sanitization des entrees
- CORS configure
- Limitation taille des requetes (10 Ko)

## Deploiement

| Service | Plateforme |
|---------|-----------|
| Client (Next.js) | Vercel - auto-deploy depuis `main` |
| Serveur (Express) | Railway - auto-deploy depuis `main` |
| Base de donnees | PostgreSQL sur Railway |
| Redis | Redis sur Railway |

## Licence

MIT - Voir [LICENSE](LICENSE)

## Auteur

**Johan Agouni** - Developpeur Web Backend/Frontend

- GitHub : [@Johan-Agouni](https://github.com/Johan-Agouni)
- Email : agouni.johan@proton.me
- Disponible en freelance - Aix-en-Provence, France

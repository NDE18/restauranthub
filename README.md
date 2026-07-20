# RestaurantHub — Plateforme de Restauration Microservices

Plateforme web complète pour groupe de restauration, construite sur une architecture microservices polyglotte. Permet la réservation de table, la commande en ligne (Click & Collect et livraison), le suivi GPS en temps réel, et un programme de fidélité multi-tiers.

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Architecture](#2-architecture)
3. [Stack technique](#3-stack-technique)
4. [Services](#4-services)
5. [Infrastructure](#5-infrastructure)
6. [Communication inter-services (Kafka)](#6-communication-inter-services-kafka)
7. [Frontend](#7-frontend)
8. [Patterns & décisions d'architecture](#8-patterns--décisions-darchitecture)
9. [Sécurité](#9-sécurité)
10. [Démarrage local](#10-démarrage-local)
11. [Variables d'environnement](#11-variables-denvironnement)
12. [Structure du projet](#12-structure-du-projet)
13. [API Documentation](#13-api-documentation)
14. [Tests](#14-tests)

---

## 1. Vue d'ensemble

RestaurantHub est une plateforme SaaS B2B2C destinée aux groupes de restauration. Elle expose :

- **Un site client** (Next.js 14) — consultation des restaurants, réservation, commande, suivi GPS, fidélité
- **Une interface d'administration** — gestion des restaurants, menus, commandes, clients, analytics
- **10 microservices indépendants** — chacun avec sa propre base de données, son domaine métier et ses événements Kafka
- **Une infrastructure complète** — Kafka, Redis, 7× PostgreSQL, 2× MongoDB, Keycloak, Meilisearch

### Fonctionnalités principales

| Domaine | Fonctionnalités |
|---|---|
| Restaurants | Listing, recherche géolocalisée, filtres cuisine/service, horaires |
| Réservation | Créneaux disponibles, anti-overbooking, rappels automatiques J-1 |
| Commande | Click & Collect, livraison, Saga orchestrée, paiement Stripe |
| Livraison | Assignation livreur, suivi GPS WebSocket temps réel |
| Fidélité | Points par commande, tiers BRONZE→PLATINUM, récompenses, parrainage |
| Notifications | Email (SendGrid), SMS (Twilio), Push (Firebase) |
| Analytics | KPI tableau de bord, CA quotidien, recommandations collaboratives |
| Sécurité | OAuth2/OIDC Keycloak, JWT RS256, RGPD (export + suppression) |

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Next.js 14)                      │
│   Public · Compte client · Administration                       │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS / REST / WebSocket
                            ▼
                    ┌───────────────┐
                    │  API Gateway  │  (à venir — Kong / Nginx)
                    └───────┬───────┘
                            │
        ┌───────────────────┼───────────────────────┐
        ▼                   ▼                       ▼
┌──────────────┐   ┌──────────────┐       ┌──────────────────┐
│ service-user │   │service-order │  ...  │service-analytics │
│  :8001       │   │  :8005       │       │   :8010          │
│  PostgreSQL  │   │  PostgreSQL  │       │   PostgreSQL      │
└──────────────┘   └──────┬───────┘       └──────────────────┘
                          │
                   ┌──────▼──────────────────────────────────┐
                   │              Apache Kafka                │
                   │  (Confluent CP 7.6 · 9 topics + 2 DLQ) │
                   └──────────────────────────────────────────┘
```

### Principe Database-per-Service

Chaque service possède sa propre instance de base de données. Aucun service ne partage une base avec un autre. La cohérence inter-services est assurée exclusivement par les événements Kafka.

---

## 3. Stack technique

### Backend

| Runtime | Framework | Services |
|---|---|---|
| Java 21 | Spring Boot 3.2 | user, restaurant, reservation, order, payment |
| Node.js 20 | NestJS 10 + TypeScript | menu, delivery, notification |
| Python 3.12 | FastAPI 0.111 | loyalty, analytics |

### Frontend

| Technologie | Usage |
|---|---|
| Next.js 14 (App Router) | Framework React SSR/SSG |
| TypeScript | Typage statique |
| Tailwind CSS + shadcn/ui | Design system (composants Radix UI) |
| NextAuth.js | Authentification OAuth2 Keycloak |
| Zustand | État global (panier, persistance localStorage) |
| SWR | Data fetching avec cache et revalidation |
| Stripe.js | Paiement côté client |
| Socket.IO Client | Temps réel (menu, livraison GPS) |
| Recharts | Graphiques analytics |
| React Hook Form + Zod | Formulaires et validation |

### Infrastructure

| Service | Technologie | Version |
|---|---|---|
| Message broker | Apache Kafka (Confluent CP) | 7.6 |
| Cache / sessions | Redis | 7.2 |
| Bases relationnelles | PostgreSQL | 15 |
| Bases document | MongoDB | 7 |
| IAM / Auth | Keycloak | 24 |
| Recherche full-text | Meilisearch | latest |
| Conteneurisation | Docker + Docker Compose | — |

---

## 4. Services

### service-user · port 8001
**Runtime :** Java 21 / Spring Boot 3.2
**Base de données :** PostgreSQL (port 5432)

Gestion des comptes utilisateurs, authentification et consentements RGPD.

| Endpoint | Méthode | Description |
|---|---|---|
| `/api/v1/auth/register` | POST | Inscription |
| `/api/v1/auth/login` | POST | Connexion (JWT) |
| `/api/v1/auth/refresh` | POST | Renouvellement token |
| `/api/v1/auth/logout` | POST | Déconnexion |
| `/api/v1/users/me` | GET / PATCH / DELETE | Profil utilisateur |
| `/api/v1/users/me/data-export` | GET | Export RGPD (JSON) |
| `/api/v1/auth/forgot-password` | POST | Réinitialisation mot de passe |

**Événements publiés :** `user.created`, `user.updated`, `user.deleted`, `user.email-verified`

**Particularités :**
- Hachage mot de passe : **Argon2id**
- Anonymisation RGPD à la suppression (nom, email, téléphone → valeurs neutres)
- Rôles : `ROLE_CUSTOMER`, `ROLE_MANAGER`, `ROLE_STAFF_HALL`, `ROLE_STAFF_KITCHEN`, `ROLE_DELIVERY`, `ROLE_SUPER_ADMIN`

---

### service-restaurant · port 8002
**Runtime :** Java 21 / Spring Boot 3.2
**Base de données :** PostgreSQL (port 5433) + extension PostGIS

Référentiel des restaurants, horaires et capacités.

| Endpoint | Méthode | Description |
|---|---|---|
| `/api/v1/restaurants` | GET | Liste paginée |
| `/api/v1/restaurants/nearby` | GET | Restaurants à proximité (lat/lng/radius) |
| `/api/v1/restaurants/{id}` | GET / PATCH | Détail et mise à jour |
| `/api/v1/restaurants` | POST | Création |
| `/api/v1/restaurants/{id}/schedule` | GET | Horaires d'ouverture |

**Événements publiés :** `restaurant.created`, `restaurant.updated`, `restaurant.closed`

**Particularités :**
- Recherche géospatiale via `earth_distance` + `ll_to_earth` (extension PostgreSQL)
- Gestion des horaires par jour de semaine et des fermetures exceptionnelles

---

### service-menu · port 8003
**Runtime :** Node.js 20 / NestJS 10
**Base de données :** MongoDB (port 27017)

CRUD des articles de menu avec disponibilité temps réel via WebSocket.

| Endpoint | Méthode | Description |
|---|---|---|
| `/api/v1/menus/restaurant/:id` | GET | Menu complet d'un restaurant |
| `/api/v1/menus` | POST | Création d'un article |
| `/api/v1/menus/:id` | PATCH / DELETE | Modification / Suppression |
| `/api/v1/menus/:id/availability` | PATCH | Mise à jour disponibilité |

**WebSocket :** `ws://service-menu/ws/menus`
- `subscribe` → rejoindre la room d'un restaurant
- `availability_changed` → notification temps réel aux clients connectés

**Événements consommés :** `restaurant.deleted` (cascade suppression menu)

**Particularités :**
- Pattern **CQRS** : lectures depuis Redis (cache), écritures vers MongoDB
- Index textuel MongoDB pour la recherche par nom/description/tags

---

### service-reservation · port 8004
**Runtime :** Java 21 / Spring Boot 3.2
**Base de données :** PostgreSQL (port 5434)

Réservation de tables avec protection anti-overbooking.

| Endpoint | Méthode | Description |
|---|---|---|
| `/api/v1/reservations` | POST | Créer une réservation |
| `/api/v1/reservations/my` | GET | Réservations de l'utilisateur |
| `/api/v1/reservations/{id}` | GET / DELETE | Détail / Annulation |
| `/api/v1/reservations/{id}/confirm` | PATCH | Confirmation (admin) |
| `/api/v1/reservations/available-slots` | GET | Créneaux disponibles |

**Événements publiés :** `reservation.created`, `reservation.confirmed`, `reservation.cancelled`

**Particularités :**
- **Verrou distribué Redisson** (Redis) — évite les double-réservations sur le même créneau
- **Optimistic locking JPA** (`@Version`) — sécurité supplémentaire au niveau base
- **Idempotency key** — `idempotencyKey` unique en base pour éviter les doublons
- **Rappels automatiques** — `@Scheduled` cron 10h chaque matin, rappels J-1 par Kafka

---

### service-order · port 8005
**Runtime :** Java 21 / Spring Boot 3.2
**Base de données :** PostgreSQL (port 5435)

Orchestrateur de la Saga commande → paiement → livraison.

| Endpoint | Méthode | Description |
|---|---|---|
| `/api/v1/orders` | POST | Créer une commande |
| `/api/v1/orders/my` | GET | Commandes de l'utilisateur |
| `/api/v1/orders/{id}` | GET | Détail commande |
| `/api/v1/orders/{id}/status` | PATCH | Mise à jour statut (admin) |
| `/api/v1/orders/{id}/cancel` | POST | Annulation |

**Cycle de vie d'une commande :**
```
CREATED → PAID → IN_PREPARATION → READY → PICKED_UP → DELIVERED → COMPLETED
                                                    ↘ CANCELLED (tout statut)
```

**Événements publiés :** `order.created`, `order.paid`, `order.ready`, `order.completed`, `order.cancelled`
**Événements consommés :** `payment.succeeded`, `payment.failed`, `delivery.delivered`

**Particularités :**
- **Saga orchestration** via Spring State Machine 4.0
- **Outbox pattern** — table `outbox_events` garantit la publication Kafka transactionnelle
- **Idempotency key** — prévient les doubles commandes
- Taux de TVA : 10 %

---

### service-payment · port 8006
**Runtime :** Java 21 / Spring Boot 3.2
**Base de données :** PostgreSQL (port 5436) · SDK Stripe

Traitement des paiements via Stripe PaymentIntent.

| Endpoint | Méthode | Description |
|---|---|---|
| `/api/v1/payments` | POST | Créer un PaymentIntent |
| `/api/v1/payments/{id}/confirm` | POST | Confirmer le paiement |
| `/api/v1/payments/{id}/refund` | POST | Remboursement |
| `/api/v1/payments/webhook` | POST | Webhook Stripe (signature vérifiée) |

**Événements publiés :** `payment.succeeded`, `payment.failed`, `payment.refunded`

**Flux Stripe :**
1. Frontend crée un `PaymentIntent` via le service
2. Stripe.js confirme le paiement côté client
3. Stripe envoie un webhook → `payment_intent.succeeded`
4. Le service publie `payment.succeeded` → service-order avance la Saga

---

### service-delivery · port 8007
**Runtime :** Node.js 20 / NestJS 10
**Base de données :** PostgreSQL (port 5438) · BullMQ

Gestion des livraisons et tracking GPS temps réel.

| Endpoint | Méthode | Description |
|---|---|---|
| `/api/v1/deliveries` | GET | Liste livraisons |
| `/api/v1/deliveries/{id}` | GET | Détail livraison |
| `/api/v1/deliveries/{id}/accept` | POST | Livreur accepte la course |
| `/api/v1/deliveries/{id}/status` | PATCH | Mise à jour statut |
| `/api/v1/deliveries/quote` | POST | Estimation distance/frais |

**WebSocket :** `ws://service-delivery/ws/deliveries`
- `track_delivery` → rejoindre la room de suivi
- `driver_location` → position GPS du livreur (lat/lng)
- `status_changed` → changement de statut livraison

**Événements consommés :** `order.paid` (type=DELIVERY) → création automatique de livraison
**Événements publiés :** `delivery.created`, `delivery.assigned`, `delivery.delivered`

**Statuts livraison :** `PENDING → ASSIGNED → PICKED_UP → IN_TRANSIT → DELIVERED`

---

### service-loyalty · port 8008
**Runtime :** Python 3.12 / FastAPI 0.111
**Base de données :** PostgreSQL (port 5437) · Celery + Redis

Programme de fidélité avec tiers et récompenses.

| Endpoint | Méthode | Description |
|---|---|---|
| `/api/v1/loyalty/me` | GET | Mon compte fidélité |
| `/api/v1/loyalty/me/transactions` | GET | Historique des points |
| `/api/v1/loyalty/rewards` | GET | Récompenses disponibles |
| `/api/v1/loyalty/redeem` | POST | Échanger des points |
| `/api/v1/loyalty/referral` | POST | Générer un code parrainage |
| `/api/v1/loyalty/referral/apply` | POST | Appliquer un code parrainage |

**Tiers de fidélité :**

| Tier | Seuil | Couleur |
|---|---|---|
| BRONZE | 0 pt | Ambre |
| SILVER | 1 000 pts | Gris |
| GOLD | 5 000 pts | Or |
| PLATINUM | 15 000 pts | Bleu |

**Événements consommés :** `user.created` (création compte fidélité), `order.paid` (crédit points), `delivery.delivered` (bonus livraison)
**Événements publiés :** `loyalty.points-credited`, `loyalty.tier-upgraded`, `loyalty.reward-redeemed`

---

### service-notification · port 8009
**Runtime :** Node.js 20 / NestJS 10
**Base de données :** MongoDB (port 27018) · BullMQ

Dispatch multi-canal : email, SMS, push.

**Canaux :**
- **Email** — SendGrid
- **SMS** — Twilio
- **Push** — Firebase Cloud Messaging

**Événements consommés et notifications déclenchées :**

| Événement | Canal | Destinataire |
|---|---|---|
| `user.created` | Email | Client — bienvenue |
| `user.email-verified` | Email | Client — confirmation |
| `reservation.confirmed` | Email + SMS | Client |
| `reservation.reminder` | Email + SMS | Client (J-1) |
| `order.paid` | Email + Push | Client |
| `order.ready` | Push + SMS | Client |
| `payment.succeeded` | Email | Client — reçu |
| `payment.failed` | Email + Push | Client |
| `delivery.assigned` | Push | Client — livreur en route |
| `loyalty.tier-upgraded` | Email + Push | Client |

---

### service-analytics · port 8010
**Runtime :** Python 3.12 / FastAPI 0.111
**Base de données :** PostgreSQL (port 5439) · pandas · scikit-learn

Analytique en temps réel par Event Sourcing Kafka.

| Endpoint | Méthode | Description |
|---|---|---|
| `/api/v1/analytics/kpi/daily` | GET | KPI globaux (CA, commandes, clients) |
| `/api/v1/analytics/revenue/daily` | GET | CA par jour (`?days=30`) |
| `/api/v1/analytics/top-restaurants` | GET | Top restaurants (`?limit=5`) |
| `/api/v1/analytics/order-types` | GET | Répartition C&C vs livraison |
| `/api/v1/analytics/recommendations/{userId}` | GET | Recommandations (filtrage collaboratif) |

**Événements consommés :** tous les topics (`order.*`, `reservation.*`, `user.*`, `payment.*`, `delivery.*`, `loyalty.*`)

**Particularités :**
- **Event Sourcing** — chaque événement Kafka est stocké brut puis agrégé
- **pandas** pour les agrégations KPI
- **scikit-learn** pour les recommandations collaboratives

---

## 5. Infrastructure

### Docker Compose

L'infrastructure complète est définie dans `docker-compose.yml`. Les services applicatifs sont commentés et à activer progressivement.

```bash
cp .env.example .env
docker compose up -d
```

### Bases de données

| Instance | Port | Usage |
|---|---|---|
| PostgreSQL — user | 5432 | service-user |
| PostgreSQL — restaurant | 5433 | service-restaurant |
| PostgreSQL — reservation | 5434 | service-reservation |
| PostgreSQL — order | 5435 | service-order |
| PostgreSQL — payment | 5436 | service-payment |
| PostgreSQL — loyalty | 5437 | service-loyalty |
| PostgreSQL — delivery | 5438 | service-delivery |
| MongoDB — menu | 27017 | service-menu |
| MongoDB — notification | 27018 | service-notification |

### Services de support

| Service | Port | Usage |
|---|---|---|
| Kafka (Confluent CP 7.6) | 9092 | Message broker |
| Zookeeper | 2181 | Coordination Kafka |
| Schema Registry | 8081 | Schémas Avro |
| Kafdrop UI | 9000 | Interface Kafka |
| Redis 7.2 | 6379 | Cache, sessions, BullMQ, Celery |
| Keycloak 24 | 8080 | IAM OAuth2/OIDC |
| Meilisearch | 7700 | Recherche full-text |

---

## 6. Communication inter-services (Kafka)

### Topics

| Topic | Partitions | Producteur | Consommateurs |
|---|---|---|---|
| `user-events` | 3 | service-user | service-loyalty, service-notification |
| `restaurant-events` | 3 | service-restaurant | service-menu |
| `menu-events` | 3 | service-menu | — |
| `reservation-events` | 3 | service-reservation | service-notification |
| `order-events` | **6** | service-order | service-payment, service-delivery, service-loyalty, service-notification, service-analytics |
| `payment-events` | 3 | service-payment | service-order, service-notification, service-analytics |
| `delivery-events` | 3 | service-delivery | service-order, service-notification, service-analytics |
| `loyalty-events` | 3 | service-loyalty | service-notification, service-analytics |
| `notification-events` | 3 | service-notification | service-analytics |
| `order-events.DLQ` | 1 | — | monitoring |
| `payment-events.DLQ` | 1 | — | monitoring |

### Contrats d'événements

Les schémas JSON sont versionnés dans `shared/contracts/events/` :

```
shared/contracts/events/
├── user-events.json
├── order-events.json
├── payment-events.json
├── delivery-events.json
└── loyalty-events.json
```

Exemple — `order.created` :
```json
{
  "eventType": "string",
  "orderId": "uuid",
  "userId": "uuid",
  "restaurantId": "uuid",
  "orderType": "CLICK_AND_COLLECT | DELIVERY",
  "items": "array",
  "totalAmount": "decimal",
  "idempotencyKey": "string",
  "timestamp": "iso8601"
}
```

### Flux Saga — Commande

```
Client                service-order          service-payment       service-delivery
  │                        │                       │                      │
  │──── POST /orders ──────►│                       │                      │
  │                        │──── order.created ────►│                      │
  │                        │                       │ (crée PaymentIntent)  │
  │◄────── orderId ─────────│                       │                      │
  │                        │                       │                      │
  │──── Stripe.js ──────────────────────────────────►│ (webhook)           │
  │                        │◄─── payment.succeeded ─│                      │
  │                        │ (PAID)                 │                      │
  │                        │──── order.paid ─────────────────────────────►│
  │                        │                       │                      │ (crée livraison)
  │                        │◄───────────────────────────── delivery.delivered
  │                        │ (COMPLETED)            │                      │
```

---

## 7. Frontend

### Pages

#### Public (sans authentification)

| Route | Description |
|---|---|
| `/` | Page d'accueil — hero, restaurants vedettes, fidélité |
| `/restaurants` | Listing avec filtres (cuisine, service, recherche) |
| `/restaurants/[id]` | Fiche restaurant — infos, horaires, actions |
| `/restaurants/[id]/menu` | Menu interactif avec panier temps réel |
| `/restaurants/[id]/reserver` | Réservation 3 étapes (date → créneau → confirmation) |
| `/commande` | Panier — articles, C&C vs livraison, récapitulatif, paiement |
| `/commande/[id]` | Suivi commande — stepper statut, carte GPS livreur |
| `/auth/connexion` | Connexion |
| `/auth/inscription` | Inscription |
| `/auth/mot-de-passe-oublie` | Réinitialisation mot de passe |
| `/mentions-legales` | Mentions légales |
| `/politique-confidentialite` | Politique de confidentialité (RGPD) |

#### Espace client (authentification requise)

| Route | Description |
|---|---|
| `/mon-compte` | Dashboard — stats commandes, réservations, points |
| `/mon-compte/reservations` | Liste des réservations |
| `/mon-compte/reservations/[id]` | Détail et annulation |
| `/mon-compte/commandes` | Historique commandes |
| `/mon-compte/commandes/[id]` | Détail commande + lien suivi |
| `/mon-compte/fidelite` | Points, tiers, code parrainage, récompenses |
| `/mon-compte/profil` | Édition profil, changement mot de passe |
| `/mon-compte/donnees` | RGPD — export JSON, suppression compte |

#### Administration (rôles SUPER_ADMIN / MANAGER)

| Route | Description |
|---|---|
| `/admin` | Dashboard KPI + graphiques (CA, commandes par statut) |
| `/admin/restaurants` | Liste et gestion des restaurants |
| `/admin/restaurants/[id]` | Édition restaurant |
| `/admin/restaurants/[id]/menus` | Gestion des plats (CRUD, disponibilité) |
| `/admin/reservations` | Toutes les réservations + confirmation |
| `/admin/commandes` | Toutes les commandes + avancement statut |
| `/admin/clients` | Gestion clients (suspension/réactivation) |
| `/admin/livraisons` | Suivi des livraisons en cours |
| `/admin/fidelite` | Récompenses CRUD, configuration des tiers |
| `/admin/analytics` | AreaChart CA, top restaurants, répartition types |
| `/admin/parametres` | Configuration plateforme (frais, TVA, notifications) |

### Panier (Zustand)

Le panier est géré avec **Zustand + persistance localStorage**. Il respecte la contrainte de commande mono-restaurant : si l'utilisateur ajoute un article d'un autre restaurant, une confirmation lui est demandée avant de vider le panier.

```ts
const { items, addItem, updateQuantity, removeItem, clear, totalPrice, restaurantId } = useCart()
```

### Temps réel (Socket.IO)

```ts
// Disponibilité menu
const { menuItems } = useMenuSocket(restaurantId)

// Suivi livraison GPS
const { location, status } = useDeliverySocket(orderId)
```

---

## 8. Patterns & décisions d'architecture

### Saga — Orchestration (service-order)

Le service-order est l'orchestrateur unique de la Saga commande. Il écoute les événements de paiement et de livraison pour faire avancer la machine d'états (Spring State Machine).

### Outbox Pattern (service-order)

La table `outbox_events` garantit l'atomicité entre la transaction base de données et la publication Kafka. Un processus dédié lit la table outbox et publie les événements en attente.

### Anti-Overbooking (service-reservation)

Double protection :
1. **Verrou distribué Redisson** (Redis) — un seul thread à la fois peut vérifier la disponibilité d'un créneau
2. **Optimistic locking JPA** (`@Version`) — filet de sécurité au niveau base de données

### Idempotence

Les tables `orders`, `reservations` et `payments` ont une colonne `idempotency_key` unique. Si le client renvoie la même requête (retry réseau), le serveur retourne la ressource existante sans créer de doublon.

### CQRS (service-menu)

- **Lecture** : données servies depuis Redis (cache chaud)
- **Écriture** : persistée dans MongoDB, puis cache invalidé/mis à jour
- **Temps réel** : WebSocket notifie les clients des changements de disponibilité

### Circuit Breaker

Resilience4j est configuré sur les appels inter-services critiques (order → payment, order → delivery).

---

## 9. Sécurité

### Authentification — Keycloak 24

- Protocole **OAuth2 / OpenID Connect**
- Realm `restaurant`
- Tokens **JWT RS256** (asymétrique)
- Chaque service Spring Boot est configuré en **OAuth2 Resource Server** (validation JWT sans appel réseau)

### Mots de passe

Algorithme **Argon2id** (conforme OWASP) via Spring Security Crypto.

### Autorisation

- Spring Security `@PreAuthorize` sur les endpoints sensibles
- Middleware Next.js pour la protection des routes `/mon-compte/*` et `/admin/*`
- Vérification du rôle `ROLE_SUPER_ADMIN` ou `ROLE_MANAGER` pour l'accès admin

### RGPD

- **Export des données** : endpoint `GET /api/v1/users/me/data-export` (JSON complet)
- **Droit à l'oubli** : `DELETE /api/v1/users/me` → anonymisation (nom/email/téléphone remplacés par des valeurs neutres, commandes et réservations conservées anonymisées)
- **Consentements** : table `user_consents` tracée avec date et version

### Stripe

- Vérification de la **signature webhook** (`Stripe-Signature` header) via `Webhook.constructEvent()`
- Les données de carte ne transitent jamais par les serveurs — traitement direct Stripe.js → Stripe

---

## 10. Démarrage local

### Prérequis

- Docker Desktop ≥ 4.x
- Docker Compose ≥ 2.x
- Node.js ≥ 20 (développement frontend)
- Java 21 + Maven (développement services Java)
- Python 3.12 + pip (développement services Python)

### Infrastructure

```bash
# 1. Cloner le dépôt
git clone <repository-url>
cd ecommerce

# 2. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos clés (Stripe, SendGrid, etc.)

# 3. Démarrer l'infrastructure complète
docker compose up -d

# Vérifier que tout est sain
docker compose ps
```

Les services démarrent dans l'ordre grâce aux `healthcheck` et `depends_on`.

### Interfaces accessibles après démarrage

| Service | URL |
|---|---|
| Kafdrop (Kafka UI) | http://localhost:9000 |
| Keycloak Admin | http://localhost:8080 (admin/admin) |
| Meilisearch | http://localhost:7700 |

### Développement d'un service Java

```bash
cd services/service-user
./mvnw spring-boot:run
# Swagger UI : http://localhost:8001/swagger-ui.html
```

### Développement d'un service NestJS

```bash
cd services/service-menu
npm install
npm run start:dev
```

### Développement d'un service Python

```bash
cd services/service-loyalty
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8008
# Swagger UI : http://localhost:8008/docs
```

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Éditer .env.locals
npm run dev
# http://localhost:3000
```

### Build Docker d'un service

```bash
# Exemple — service-user
docker build -t restauranthub/service-user:latest services/service-user/

# Frontend
docker build -t restauranthub/frontend:latest frontend/
```

---

## 11. Variables d'environnement

Le fichier `.env.example` à la racine contient toutes les variables nécessaires. Copiez-le en `.env` et renseignez les valeurs.

### Variables principales

| Variable | Description | Exemple |
|---|---|---|
| `POSTGRES_PASSWORD` | Mot de passe PostgreSQL global | `changeme` |
| `MONGO_INITDB_ROOT_PASSWORD` | Mot de passe MongoDB | `changeme` |
| `KEYCLOAK_ADMIN_PASSWORD` | Mot de passe admin Keycloak | `admin` |
| `JWT_SECRET` | Secret JWT (services NestJS/Python) | `your-256-bit-secret` |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Secret webhook Stripe | `whsec_...` |
| `STRIPE_PUBLIC_KEY` | Clé publique Stripe (frontend) | `pk_test_...` |
| `SENDGRID_API_KEY` | Clé API SendGrid (emails) | `SG.xxx` |
| `TWILIO_ACCOUNT_SID` | SID Twilio (SMS) | `ACxxx` |
| `TWILIO_AUTH_TOKEN` | Token Twilio | `xxx` |
| `FIREBASE_SERVER_KEY` | Clé Firebase (push) | `xxx` |
| `GOOGLE_MAPS_API_KEY` | Clé Google Maps | `AIzaXXX` |
| `CLOUDINARY_URL` | URL Cloudinary (images) | `cloudinary://...` |
| `MEILISEARCH_API_KEY` | Clé Meilisearch | `masterKey` |
| `NEXTAUTH_SECRET` | Secret NextAuth.js | `openssl rand -hex 32` |
| `NEXTAUTH_URL` | URL de l'application Next.js | `http://localhost:3000` |

### Variables frontend (`.env.local`)

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<openssl rand -hex 32>
KEYCLOAK_CLIENT_ID=restaurant-frontend
KEYCLOAK_CLIENT_SECRET=<secret>
KEYCLOAK_ISSUER=http://localhost:8080/realms/restaurant
NEXT_PUBLIC_API_URL=http://localhost:8001
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_WS_MENU_URL=ws://localhost:8003
NEXT_PUBLIC_WS_DELIVERY_URL=ws://localhost:8007
```

---

## 12. Structure du projet

```
restaurant/
├── docker-compose.yml              # Infrastructure complète
├── .env.example                    # Template variables d'environnement
├── README.md                       # Ce fichier
│
├── shared/
│   └── contracts/
│       └── events/                 # Schémas d'événements Kafka (JSON)
│           ├── user-events.json
│           ├── order-events.json
│           ├── payment-events.json
│           ├── delivery-events.json
│           └── loyalty-events.json
│
├── frontend/                       # Next.js 14 App Router
│   ├── Dockerfile
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── .env.local.example
│   └── src/
│       ├── app/
│       │   ├── (public)/           # Pages publiques
│       │   ├── (account)/          # Espace client (auth requise)
│       │   └── (admin)/            # Administration (rôle requis)
│       ├── components/
│       │   ├── ui/                 # shadcn/ui (Button, Card, Badge…)
│       │   └── layout/             # Navbar, Footer, sidebars
│       ├── hooks/                  # useCart, useSocket
│       ├── lib/
│       │   ├── api/                # Clients API typés par service
│       │   ├── auth.ts             # NextAuth config Keycloak
│       │   └── utils.ts            # cn(), formatPrice(), labels…
│       └── types/
│           └── index.ts            # Interfaces TypeScript globales
│
└── services/
    ├── service-user/               # Java 21 / Spring Boot 3.2
    │   ├── Dockerfile
    │   ├── pom.xml
    │   └── src/main/
    │       ├── java/com/restaurant/user/
    │       │   ├── api/controller/
    │       │   ├── application/
    │       │   ├── domain/model/
    │       │   ├── events/
    │       │   └── config/
    │       └── resources/
    │           ├── application.yml
    │           └── db/migration/   # Flyway SQL
    │
    ├── service-restaurant/         # Java 21 / Spring Boot 3.2
    ├── service-reservation/        # Java 21 / Spring Boot 3.2
    ├── service-order/              # Java 21 / Spring Boot 3.2 + State Machine
    ├── service-payment/            # Java 21 / Spring Boot 3.2 + Stripe SDK
    │
    ├── service-menu/               # Node.js 20 / NestJS 10
    │   ├── Dockerfile
    │   ├── package.json
    │   └── src/menu/
    │       ├── schemas/            # Mongoose schemas
    │       ├── menu.gateway.ts     # WebSocket Socket.IO
    │       ├── menu.service.ts
    │       └── kafka/
    │
    ├── service-delivery/           # Node.js 20 / NestJS 10
    │   └── src/delivery/
    │       ├── delivery.gateway.ts # WebSocket GPS
    │       └── kafka/
    │
    ├── service-notification/       # Node.js 20 / NestJS 10
    │   └── src/notification/
    │       ├── notification.service.ts  # SendGrid + Twilio + Firebase
    │       └── kafka/
    │
    ├── service-loyalty/            # Python 3.12 / FastAPI
    │   ├── Dockerfile
    │   ├── requirements.txt
    │   └── app/
    │       ├── api/v1/
    │       ├── db/models.py        # SQLAlchemy
    │       ├── services/
    │       └── kafka/consumer.py   # aiokafka
    │
    └── service-analytics/          # Python 3.12 / FastAPI
        └── app/
            ├── api/v1/
            ├── db/models.py        # Event Sourcing models
            ├── services/           # pandas + scikit-learn
            └── kafka/consumer.py
```

---

## 13. API Documentation

Chaque service expose automatiquement sa documentation OpenAPI :

| Service | URL Swagger |
|---|---|
| service-user | http://localhost:8001/swagger-ui.html |
| service-restaurant | http://localhost:8002/swagger-ui.html |
| service-reservation | http://localhost:8004/swagger-ui.html |
| service-order | http://localhost:8005/swagger-ui.html |
| service-payment | http://localhost:8006/swagger-ui.html |
| service-loyalty | http://localhost:8008/docs |
| service-analytics | http://localhost:8010/docs |

Les services NestJS exposent leur documentation via `@nestjs/swagger` (à configurer) sur `/api`.

---

## 14. Tests

### Services Java (JUnit 5 + Testcontainers)

```bash
cd services/service-user
./mvnw test

# Tests d'intégration avec vraie base PostgreSQL
./mvnw verify -P integration-tests
```

Testcontainers démarre automatiquement une instance PostgreSQL éphémère pour les tests d'intégration. WireMock est utilisé pour les mocks d'APIs externes (Stripe dans service-payment).

### Services NestJS (Jest)

```bash
cd services/service-menu
npm test              # Tests unitaires
npm run test:e2e      # Tests end-to-end
npm run test:cov      # Coverage
```

### Services Python (pytest)

```bash
cd services/service-loyalty
pip install pytest pytest-asyncio httpx
pytest --cov=app tests/
```

### Frontend (Jest + Testing Library)

```bash
cd frontend
npm test
npm run test:e2e      # Playwright (à configurer)
```

---

## Licence

Ce projet est développé à titre pédagogique et interne. Tous droits réservés — RestaurantHub SAS.

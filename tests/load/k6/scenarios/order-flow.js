/**
 * Scénario k6 — Flux commande complet
 * Cibles cahier des charges :
 *   - 200 VUs simultanés sans dégradation (charge nominale)
 *   - Latence API p95 lecture < 300ms
 *   - Latence API p95 écriture < 600ms
 *   - Disponibilité ≥ 99,5%
 *
 * Usage :
 *   k6 run --env BASE_URL=https://api.restauranthub.fr scenarios/order-flow.js
 *   k6 run --env BASE_URL=http://localhost --vus 200 --duration 5m scenarios/order-flow.js
 */

import http from 'k6/http'
import { check, group, sleep } from 'k6'
import { Rate, Trend, Counter } from 'k6/metrics'
import { randomIntBetween, randomItem } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js'

// ── Métriques personnalisées ────────────────────────────────────────────────
const errorRate         = new Rate('error_rate')
const orderCreationTime = new Trend('order_creation_time', true)
const menuLoadTime      = new Trend('menu_load_time', true)
const ordersCreated     = new Counter('orders_created')
const paymentAttempts   = new Counter('payment_attempts')

// ── Configuration des scénarios ─────────────────────────────────────────────
export const options = {
  scenarios: {
    // Charge nominale — 200 VUs pendant 5 minutes
    nominal_load: {
      executor: 'constant-vus',
      vus: 200,
      duration: '5m',
      tags: { scenario: 'nominal' },
    },
    // Montée en charge progressive (ramp-up)
    ramp_up: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 100 },
        { duration: '5m', target: 200 },
        { duration: '2m', target: 500 },  // pointe
        { duration: '1m', target: 1000 }, // stress
        { duration: '2m', target: 0 },
      ],
      tags: { scenario: 'ramp_up' },
    },
  },
  thresholds: {
    // Cibles du cahier des charges
    'http_req_duration{type:read}':   ['p(95)<300'],   // < 300ms p95 lecture
    'http_req_duration{type:write}':  ['p(95)<600'],   // < 600ms p95 écriture
    'error_rate':                     ['rate<0.005'],  // < 0,5% erreurs (= 99,5% dispo)
    'http_req_failed':                ['rate<0.01'],   // < 1% requêtes échouées
    'order_creation_time':            ['p(95)<600'],   // Création commande < 600ms p95
    'menu_load_time':                 ['p(95)<300'],   // Chargement menu < 300ms p95
  },
}

const BASE_URL   = __ENV.BASE_URL || 'http://localhost'
const API        = `${BASE_URL}/api/v1`
const HEADERS    = { 'Content-Type': 'application/json', 'Accept': 'application/json' }

// IDs de restaurants de test (à adapter selon les données seed)
const RESTAURANT_IDS = [
  'rest-001', 'rest-002', 'rest-003', 'rest-004', 'rest-005',
]

export function setup() {
  // Authentification et récupération du token
  const loginRes = http.post(`${API}/auth/login`, JSON.stringify({
    email: 'loadtest@restauranthub.fr',
    password: 'LoadTest123!',
  }), { headers: HEADERS })

  check(loginRes, { 'Login OK': (r) => r.status === 200 })

  const token = loginRes.json('accessToken')
  return { token }
}

export default function(data) {
  const authHeaders = {
    ...HEADERS,
    Authorization: `Bearer ${data.token}`,
  }
  const restaurantId = randomItem(RESTAURANT_IDS)

  // ── Étape 1 : Consultation du menu ──────────────────────────────────────
  group('Chargement menu', () => {
    const start = Date.now()
    const res = http.get(`${API}/menus/restaurant/${restaurantId}`, {
      headers: authHeaders,
      tags: { type: 'read', name: 'GET /menus' },
    })
    menuLoadTime.add(Date.now() - start)

    const ok = check(res, {
      'Menu status 200': (r) => r.status === 200,
      'Menu body non-vide': (r) => r.json().length > 0,
    })
    errorRate.add(!ok)
  })

  sleep(randomIntBetween(1, 3))

  // ── Étape 2 : Création de la commande ─────────────────────────────────
  let orderId = null
  group('Création commande', () => {
    const payload = {
      restaurantId,
      orderType: randomItem(['CLICK_AND_COLLECT', 'DELIVERY']),
      idempotencyKey: `k6-${__VU}-${__ITER}-${Date.now()}`,
      items: [
        { menuItemId: `item-${randomIntBetween(1, 10)}`, quantity: randomIntBetween(1, 3) },
      ],
      deliveryAddress: '42 rue de la Paix, Paris 75001',
    }

    const start = Date.now()
    const res = http.post(`${API}/orders`, JSON.stringify(payload), {
      headers: authHeaders,
      tags: { type: 'write', name: 'POST /orders' },
    })
    orderCreationTime.add(Date.now() - start)

    const ok = check(res, {
      'Commande créée 201': (r) => r.status === 201,
      'Commande a un ID':   (r) => r.json('id') !== undefined,
    })
    errorRate.add(!ok)

    if (ok) {
      orderId = res.json('id')
      ordersCreated.add(1)
    }
  })

  if (!orderId) return
  sleep(randomIntBetween(1, 2))

  // ── Étape 3 : Initiation du paiement ──────────────────────────────────
  group('Initiation paiement', () => {
    paymentAttempts.add(1)
    const res = http.post(`${API}/payments`, JSON.stringify({
      orderId,
      idempotencyKey: `pay-${__VU}-${__ITER}-${Date.now()}`,
    }), {
      headers: authHeaders,
      tags: { type: 'write', name: 'POST /payments' },
    })

    const ok = check(res, {
      'PaymentIntent créé': (r) => r.status === 201 || r.status === 200,
      'ClientSecret présent': (r) => r.json('clientSecret') !== undefined,
    })
    errorRate.add(!ok)
  })

  sleep(randomIntBetween(2, 5))

  // ── Étape 4 : Suivi de commande ────────────────────────────────────────
  group('Suivi commande', () => {
    const res = http.get(`${API}/orders/${orderId}`, {
      headers: authHeaders,
      tags: { type: 'read', name: 'GET /orders/:id' },
    })

    const ok = check(res, {
      'Commande trouvée': (r) => r.status === 200,
      'Status valide': (r) => ['CREATED', 'PAID', 'IN_PREPARATION'].includes(r.json('status')),
    })
    errorRate.add(!ok)
  })

  sleep(randomIntBetween(1, 3))
}

export function teardown(data) {
  console.log(`Load test terminé. Total commandes créées.`)
}

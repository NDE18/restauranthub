/**
 * Scénario k6 — Réservations (pic vendredi soir)
 * Simule un pic de réservations entre 18h et 20h le vendredi.
 *
 * Usage :
 *   k6 run --env BASE_URL=http://localhost scenarios/reservation-flow.js
 */

import http from 'k6/http'
import { check, group, sleep } from 'k6'
import { Rate, Trend, Counter } from 'k6/metrics'
import { randomIntBetween, randomItem } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js'

const errorRate            = new Rate('error_rate')
const slotCheckTime        = new Trend('slot_check_time', true)
const reservationTime      = new Trend('reservation_creation_time', true)
const reservationsCreated  = new Counter('reservations_created')
const conflictsDetected    = new Counter('overbooking_conflicts')

export const options = {
  scenarios: {
    // Simulation du pic vendredi soir — forte montée puis descente
    friday_peak: {
      executor: 'ramping-arrival-rate',
      startRate: 5,
      timeUnit: '1s',
      preAllocatedVUs: 100,
      maxVUs: 500,
      stages: [
        { duration: '2m', target: 10 },  // montée progressive
        { duration: '5m', target: 50 },  // pic principal
        { duration: '3m', target: 100 }, // pic extrême (stress)
        { duration: '2m', target: 10 },  // descente
      ],
    },
    // Test de concurrence — overbooking protection
    concurrency_test: {
      executor: 'shared-iterations',
      vus: 50,
      iterations: 500,
      maxDuration: '3m',
      tags: { scenario: 'concurrency' },
    },
  },
  thresholds: {
    'http_req_duration{name:GET /slots}':           ['p(95)<300'],
    'http_req_duration{name:POST /reservations}':   ['p(95)<600'],
    'error_rate':                                   ['rate<0.005'],
    'http_req_failed':                              ['rate<0.01'],
    // Aucun overbooking toléré (contrainte forte)
    'overbooking_conflicts':                        ['count<1'],
  },
}

const BASE_URL = __ENV.BASE_URL || 'http://localhost'
const API      = `${BASE_URL}/api/v1`
const HEADERS  = { 'Content-Type': 'application/json' }

const RESTAURANT_IDS = ['rest-001', 'rest-002', 'rest-003']
const TIME_SLOTS     = ['19:00', '19:30', '20:00', '20:30', '21:00']

export function setup() {
  const res = http.post(`${API}/auth/login`, JSON.stringify({
    email: 'loadtest@restauranthub.fr',
    password: 'LoadTest123!',
  }), { headers: HEADERS })
  return { token: res.json('accessToken') }
}

export default function(data) {
  const authHeaders = { ...HEADERS, Authorization: `Bearer ${data.token}` }
  const restaurantId = randomItem(RESTAURANT_IDS)
  const targetDate   = '2026-06-06'  // Vendredi futur fixe pour reproductibilité
  const slot         = randomItem(TIME_SLOTS)

  // ── Vérification des créneaux disponibles ─────────────────────────────
  group('Consultation créneaux', () => {
    const start = Date.now()
    const res = http.get(
      `${API}/reservations/available-slots?restaurantId=${restaurantId}&date=${targetDate}`,
      { headers: authHeaders, tags: { name: 'GET /slots', type: 'read' } }
    )
    slotCheckTime.add(Date.now() - start)

    check(res, {
      'Créneaux disponibles 200': (r) => r.status === 200,
      'Liste de créneaux': (r) => Array.isArray(r.json()),
    })
  })

  sleep(randomIntBetween(1, 3))

  // ── Tentative de réservation (concurrente = test anti-overbooking) ──
  group('Création réservation', () => {
    const idempotencyKey = `res-${__VU}-${__ITER}-${Date.now()}`
    const payload = {
      restaurantId,
      date: targetDate,
      timeSlot: slot,
      guestCount: randomIntBetween(2, 6),
      specialRequests: 'Anniversaire',
      idempotencyKey,
    }

    const start = Date.now()
    const res = http.post(`${API}/reservations`, JSON.stringify(payload), {
      headers: authHeaders,
      tags: { name: 'POST /reservations', type: 'write' },
    })
    reservationTime.add(Date.now() - start)

    if (res.status === 201) {
      check(res, {
        'Réservation créée': (r) => r.json('id') !== undefined,
        'Status PENDING': (r) => r.json('status') === 'PENDING',
      })
      reservationsCreated.add(1)
    } else if (res.status === 409) {
      // Conflit = créneau plein = comportement attendu, PAS un overbooking
      check(res, { 'Conflit géré (409)': (r) => r.status === 409 })
    } else if (res.status === 200) {
      // Idempotence — même clé, même résultat
      check(res, { 'Idempotence OK': (r) => r.json('id') !== undefined })
    } else {
      // Erreur inattendue = potentiel overbooking ou bug
      conflictsDetected.add(1)
      check(res, { 'Erreur inattendue': () => false })
    }
  })

  sleep(randomIntBetween(2, 4))
}

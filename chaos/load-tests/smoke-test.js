import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '1m', target: 10 },
    { duration: '3m', target: 50 },
    { duration: '2m', target: 100 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    errors: ['rate<0.05'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:80';

export default function () {
  // Lister les restaurants
  const restaurants = http.get(`${BASE_URL}/api/v1/restaurants`);
  check(restaurants, {
    'restaurants status 200': (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(1);

  // Consulter un menu
  const menus = http.get(`${BASE_URL}/api/v1/menus`);
  check(menus, {
    'menus status 200': (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(1);

  // Creer une commande
  const order = http.post(
    `${BASE_URL}/api/v1/orders`,
    JSON.stringify({
      restaurantId: '1',
      items: [{ menuItemId: '1', quantity: 2 }],
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  check(order, {
    'order status 2xx': (r) => r.status >= 200 && r.status < 300,
  }) || errorRate.add(1);

  sleep(2);
}

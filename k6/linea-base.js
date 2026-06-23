import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, CREDENTIALS, NOTIFICATION_BODY } from './config.js';

export const options = {
  vus: 10,
  duration: '1m',
  thresholds: {
    http_req_duration: ['p(95)<5000'],
    http_req_failed: ['rate<0.05'],
  },
};

let token = '';

export function setup() {
  const loginResp = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify(CREDENTIALS),
    { headers: { 'Content-Type': 'application/json' } }
  );
  token = loginResp.json('token');
  return { token };
}

export default function (data) {
  const resp = http.post(
    `${BASE_URL}/notifications/send`,
    NOTIFICATION_BODY,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`,
      },
    }
  );

  check(resp, {
    'status 200': (r) => r.status === 200,
    'respuesta correcta': (r) => r.json('mensaje') !== undefined,
  });

  sleep(1);
}

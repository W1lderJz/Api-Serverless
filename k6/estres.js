import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, CREDENTIALS, NOTIFICATION_BODY } from './config.js';

export const options = {
  stages: [
    { duration: '1m', target: 100 },
    { duration: '1m', target: 250 },
    { duration: '1m', target: 500 },
    { duration: '1m', target: 750 },
    { duration: '1m', target: 1000 },
    { duration: '1m', target: 1500 },
    { duration: '1m', target: 2000 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'],
    http_req_failed: ['rate<0.05'],
  },
};

export function setup() {
  const loginResp = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify(CREDENTIALS),
    { headers: { 'Content-Type': 'application/json' } }
  );
  return { token: loginResp.json('token') };
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
  });

  sleep(1);
}

import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'https://c381cvli4m.execute-api.us-east-1.amazonaws.com';

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

export default function () {
  const loginResp = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ email: 'test@demo.com', password: 'demo1234' }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  const token = loginResp.json('token');
  if (!token) return;

  const resp = http.post(
    `${BASE_URL}/notifications/send`,
    JSON.stringify({
      email: 'wilderjimenezz03@gmail.com',
      subject: 'Prueba de Estres K6',
      message: 'Mensaje generado por prueba de estres',
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  check(resp, { 'status 200': (r) => r.status === 200 });
  sleep(1);
}

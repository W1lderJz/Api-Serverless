import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'https://c381cvli4m.execute-api.us-east-1.amazonaws.com';

export const options = {
  stages: [
    { duration: '2m', target: 50 },
    { duration: '2m', target: 100 },
    { duration: '2m', target: 250 },
    { duration: '2m', target: 500 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'],
    http_req_failed: ['rate<0.10'],
  },
};

export function setup() {
  const r = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ email: 'test@demo.com', password: 'demo1234' }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  return { token: r.json('token') };
}

export default function (data) {
  const resp = http.post(
    `${BASE_URL}/notifications/send`,
    JSON.stringify({
      email: 'wilderjimenezz03@gmail.com',
      subject: 'Prueba de Carga K6',
      message: 'Mensaje generado por prueba de carga',
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`,
      },
    }
  );

  check(resp, { 'status 200': (r) => r.status === 200 });
  sleep(1);
}

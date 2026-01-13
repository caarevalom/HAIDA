import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = { vus: 5, duration: '30s' };

export default function () {
  const url = __ENV.FRONTEND_URL || __ENV.BASE_URL || 'https://haida.stayarta.com';
  const res = http.get(url);
  check(res, { 'status < 400': (r) => r.status < 400 });
  sleep(1);
}

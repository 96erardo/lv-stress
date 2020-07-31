import http from 'k6/http';
import { check } from 'k6';
import { Rate } from 'k6/metrics';
import { randomIntBetween } from "https://jslib.k6.io/k6-utils/1.0.0/index.js";

const failRate = new Rate('failed request');

export let options = {
  thresholds: {
    ['failed request']: ['rate<0.1']
  }
}

export function setup () {
  let payload = JSON.stringify({
    query: `
      query {
        shortUrlsList (first: 100, orderBy: createdAt_DESC) {
          items {
            id
            url,
            path
          }
        }
      }
    `
  });

  let params = { 
    headers: {
      Authorization: `Bearer ${__ENV.API_TOKEN}`
    }
  };

  let res = http.post(__ENV.WORKSPACE_ENDPOINT, payload, params);
  let body = JSON.parse(res.body);

  return body.data.shortUrlsList.items;
}

export default function (data) {  
  const index = randomIntBetween(0, data.length - 1);
  const { [index]: shortUrl } = data;

  console.log('index', index);
  
  let res = http.get(`${__ENV.SHORTENER_URL}/${shortUrl.path}`, { redirects: 0 });

  check(res, {
    ['is status 302']: (r) => r.status === 302
  });

  failRate.add(res.error_code !== 0);
}
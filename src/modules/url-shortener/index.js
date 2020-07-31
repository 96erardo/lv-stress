import http from 'k6/http';
import { Rate } from 'k6/metrics';
import { randomIntBetween } from "https://jslib.k6.io/k6-utils/1.0.0/index.js";

const failRate = new Rate('failed request');

export let options = {
  stages: [
    { duration: '5s', target: 10 },
    { duration: '3m', target: 120 },
    { duration: '2m', target: 300 },
  ],
  thresholds: {
    ['failed request']: ['rate<0.05']
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
  let first = randomIntBetween(0, data.length - 1);
  let second = randomIntBetween(0, data.length - 1);
  let third = randomIntBetween(0, data.length - 1);
  const { 
    [first]: shortUrl1,
    [second]: shortUrl2,
    [third]: shortUrl3,
  } = data;

  let responses = http.batch([
    [ 'GET', `${__ENV.SHORTENER_URL}/${shortUrl1.path}`, null, { redirects: 0 } ],
    [ 'GET', `${__ENV.SHORTENER_URL}/${shortUrl2.path}`, null, { redirects: 0 } ],
    [ 'GET', `${__ENV.SHORTENER_URL}/${shortUrl3.path}`, null, { redirects: 0 } ],
  ]);

  responses.forEach(res => failRate.add(res.error_code !== 0));
}
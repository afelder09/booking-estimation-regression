const http = require('https');
const assert = require('assert');

const postToEndpoint = (service, environment, path, body) => {
  return new Promise((resolve, reject) => {
    let opts = {
      hostname: `${service}.${environment}.upside.com`,
      port: 443,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    let req = http.request(opts, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        if(res.statusCode!== 200){
          reject(res.statusCode)
        }
        else{
          resolve(body);
        }
      });
      res.on('error', (e) => {
        reject(e);
      });
    });
    req.write(body);
    req.end();
  });
}

let basePayloads = ['ARide.json', 'A.json', 'AH.json', 'AHRide.json', 'AHCar.json', 'AHCarRide.json', 'CarRide.json'];
basePayloads.forEach(async (p) => {
  console.log(`Testing ${p}`);
  let body = JSON.stringify(require(`./fixtures/${p}`));
  console.log('Required');
  const stg = await postToEndpoint('booking-estimation-service', 'stg', '/estimate-booking', body);
  console.log(`Got response from stg for ${p}`);
  const dev = await postToEndpoint('booking-estimation-service', 'dev', '/estimate-booking', body);
  console.log(`Got response from dev for ${p}`);
  assert.equal(stg.shadowPkg, dev.shadowPkg, `No match for payload ${p}`);
  console.log(`${p} passes!`);
});


const https = require('https');

const options = {
  hostname: 'api.cloudflare.com',
  path: '/client/v4/radar/quality/speed/top/locations?metric=bandwidth&limit=3&dateRange=7d',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer cfut_3oT3LKW1uPOc3a46Xdm5evnLc7gpsEKh7eMYaBpK7e603063'
  }
};

const req = https.request(options, res => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    if (res.statusCode === 200) {
      console.log('Success! Connected properly.');
    } else {
       console.log(data);
    }
  });
});

req.on('error', error => { console.error(error); });
req.end();

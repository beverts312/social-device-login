import express = require('express');
import FacebookWrapper = require('./fb/fb');

const app = express();
const fb = new FacebookWrapper();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/facebook', (req, res) => {
  fb.setAppToken().then(() => {
    fb.generateCode('publish_pages').then((code) => {
      console.log('Enter the code ' + code.user_code + ' at ' + code.verification_uri);
      fb.waitForAuth(code.code).then((auth) => {
        res.status(200).send(JSON.stringify(auth));
      }).catch((err) => {
        console.error('failed to get auth token');
        res.status(500).send(err);
      });
    }).catch((err) => {
      console.error('failed to generate code');
      res.status(500).send(err);
    });
  }).catch((err) => {
    console.error('failed to auth application');
    res.status(500).send(err);
  });
});

app.listen(3000);
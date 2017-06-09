import express = require('express');
import FacebookWrapper = require('./fb-wrapper');

const app = express();
const fb = new FacebookWrapper();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/', (req, res) => {
  fb.setAppToken().then(() => {
    fb.generateCode('publish_pages').then((code) => {
      console.log('Enter the code ' + code.code + ' at ' + code.verification_uri);
      fb.waitForAuth(code.code).then((auth) => {
        res.status(200).send(code);
      }).catch((err) => {
        res.status(500).send(err);
      });
    }).catch((err) => {
      res.status(500).send(err);
    });
  });
});

app.listen(3000);
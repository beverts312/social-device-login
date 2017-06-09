import express = require('express');
import FacebookWrapper = require('./fb/fb');
import TwitterWrapper = require('./twitter/twitter');

const app = express();
const fb = new FacebookWrapper();
const twitter = new TwitterWrapper();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// tslint:disable-next-line:max-func-body-length
Promise.all([fb.setAppToken(), twitter.setToken()]).then(() => {
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

  app.get('/twitter/url', (req, res) => {
    twitter.setToken().then(() => {
      twitter.requestUrl().then((url) => {
        res.status(200).send('Navigate to: ' + url +
          ', authorize the app, and then send request an access token by passing the pin to /twitter/pin/{pin} on this server');
      }).catch((err) => {
        console.error('failed to get url');
        res.status(500).send(err);
      });
    }).catch((err) => {
      console.error('failed to auth');
      res.status(500).send(err);
    });
  });

  app.get('/twitter/pin/:pin', (req, res) => {
    twitter.requestAccessToken(req.params.pin).then((response) => {
      res.send(response);
    });
  });

  app.listen(3000);
  console.log('Webserver started');
}).catch(() => {
  console.error('Websever failed to start');
});
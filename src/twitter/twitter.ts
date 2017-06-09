import request = require('request');

import Config = require('../config');

const baseUri = Config.twitter.baseUri;

class TwitterWrapper {
    public requestToken(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            request.post({
                url: baseUri + 'oauth/request_token',
                oauth: {
                    callback: 'oob',
                    oauth_callback: 'oob',
                    consumer_key: Config.twitter.clientId,
                    consumer_secret: Config.twitter.clientSecret
                }
            }, (err, res, data) => {
                if (res.statusCode !== 200) {
                    reject(data);
                }
                resolve(data);
            });
        });
    }

    public requestUrl(authToken: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            request.get({
                url: baseUri + 'oauth/authorize?' + authToken
            }, (err, res, data) => {
                if (res.statusCode !== 200) {
                    reject(data);
                }
                resolve(data);
            });
        });
    }
}

export = TwitterWrapper;
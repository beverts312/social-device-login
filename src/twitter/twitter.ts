import request = require('request');
import qs = require('querystring');
import jsdom = require('jsdom');
import Config = require('../config');

const baseUri = Config.twitter.baseUri;

class TwitterWrapper {
    // tslint:disable-next-line:no-any
    private oauthRes: any;
    private accessToken: string;

    public setToken(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            request.post({
                url: baseUri + 'oauth/request_token',
                oauth: {
                    callback: 'oob',
                    consumer_key: Config.twitter.clientId,
                    consumer_secret: Config.twitter.clientSecret
                }
            }, (err, res, data) => {
                if (res.statusCode !== 200) {
                    reject(data);
                }
                this.oauthRes = qs.parse(data);
                this.accessToken = qs.stringify({ oauth_token: this.oauthRes.oauth_token});
                resolve(true);
            });
        });
    }

    public requestUrl(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            request.get({
                url: baseUri + 'oauth/authorize?' + this.accessToken
            }, (err, res, data) => {
                if (res.statusCode !== 200) {
                    reject(data);
                }
                const dom = new jsdom.JSDOM(data);
                // tslint:disable-next-line:no-string-literal
                resolve(dom.window.document.getElementsByName('redirect_after_login')[0]['value']);
            });
        });
    }

    public requestAccessToken(pin: string): Promise<string> {
        const uri = baseUri + 'oauth/access_token?' + this.accessToken;
        return new Promise<string>((resolve, reject) => {
            request.post({
                url: uri,
                oauth: {
                    consumer_key: Config.twitter.clientId,
                    consumer_secret: Config.twitter.clientSecret,
                    verifier: pin
                }
            }, (err, res, data) => {
                if (res.statusCode !== 200) {
                    console.error(data);
                    reject(data);
                }
                resolve(data);
            });
        });
    }
}

export = TwitterWrapper;
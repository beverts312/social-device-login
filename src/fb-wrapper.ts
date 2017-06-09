import request = require('request');

import Code = require('./models/code');
import Auth = require('./models/auth');

const baseUri = 'https://graph.facebook.com/v2.6/';
const clientId = '1748405908799275';
const clientSecret = '5261ad53530415fd44ce041852618148';

class FbWrapper {
    private accessToken: string;

    public setAppToken(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const uri = baseUri + 'oauth/access_token?client_id=' + clientId
                + '&client_secret=' + clientSecret + '&grant_type=client_credentials';
            request.get(uri , {
            }, (err, res, data) => {
                if (err) {
                    reject(err);
                }
                this.accessToken = data.access_token;
                resolve(true);
            });
        });
    }

    public checkForAuth(code: string): Promise<Auth> {
        return new Promise<Auth>((resolve, reject) => {
            const body = {
                access_token: this.accessToken,
                code: code
            };
            request.post(baseUri + 'device/login_status', {
                body: JSON.stringify(body)
            }, (err, res, data) => {
                if (err) {
                    reject(err);
                }
                resolve(JSON.parse(data));
            });
        });
    }

    public generateCode = (scope: string): Promise<Code> => {
        return new Promise<Code>((resolve, reject) => {
            const body = {
                access_token: this.accessToken,
                scope: scope
            };
            request.post(baseUri + 'device/login', {
                body: JSON.stringify(body)
            }, (err, res, data) => {
                if (err) {
                    reject(err);
                }
                resolve(JSON.parse(data));
            });
        });

    };

    public waitForAuth = (code: string): Promise<Auth> => {
        return new Promise<Auth>((resolve, reject) => {
            const authInterval = setInterval(() => {
                this.checkForAuth(code).then((auth) => {
                    clearInterval(authInterval);
                    resolve(auth);
                }).catch((err) => {
                    console.log(err);
                });
            }, 5000);
        });
    };
}

export = FbWrapper;
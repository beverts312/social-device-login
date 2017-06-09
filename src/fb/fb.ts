import request = require('request');

import Code = require('./models/code');
import Auth = require('./models/auth');
import Config = require('../config');

const baseUri = Config.facebook.baseUri;

class FbWrapper {
    private accessToken: string;

    public setAppToken(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const uri = baseUri + 'oauth/access_token?client_id=' + Config.facebook.clientId
                + '&client_secret=' + Config.facebook.clientSecret + '&grant_type=client_credentials';
            request.get(uri , {
            }, (err, res, data) => {
                 if (res.statusCode !== 200) {
                    reject(data);
                }
                this.accessToken = JSON.parse(data).access_token;
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
                if (res.statusCode !== 200) {
                    reject(data);
                }
                resolve(JSON.parse(data));
            });
        });
    }

    public generateCode = (scope: string): Promise<Code> => {
        return new Promise<Code>((resolve, reject) => {
            const body = {
                access_token: this.accessToken,
                scope: scope,
                redirect_uri: Config.facebook.redirectPath
            };
            request.post(baseUri + 'device/login', {
                body: JSON.stringify(body)
            }, (err, res, data) => {
                if (res.statusCode !== 200) {
                    reject(data);
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
                    reject(err);
                });
            }, 5000);
        });
    };
}

export = FbWrapper;
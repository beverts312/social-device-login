const config = {
    facebook: {
        baseUri: 'https://graph.facebook.com/v2.6/',
        redirectPath: 'http://reachengine.com/',
        clientId: process.env.FB_CLIENT_ID,
        clientSecret: process.env.FB_CLIENT_SECRET
    },
    twitter: {
        baseUri: 'https://api.twitter.com/',
        clientId: process.env.TWITTER_CLIENT_ID,
        clientSecret: process.env.TWITTER_CLIENT_SECRET
    }
};
export = config;
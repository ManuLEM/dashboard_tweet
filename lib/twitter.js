var configTwitter = require ('../config/twitter');
var users =  require('./users');
var mongo =  require('./mongo');
var Twit = require('twit');
var tags = [];

var T = new Twit ({
    consumer_key: configTwitter.consumerKey,
    consumer_secret: configTwitter.consumerSecret,
    access_token: configTwitter.accessToken,
    access_token_secret: configTwitter.accessTokenSecret
});

var stream;
var twitter = {
    refresh: function (allTags) {
        for (var i = 0; i < allTags.length; i++) {
           tags.push('#' + allTags[i].name);
        }
        if (stream) {
            stream.stop();
            stream = null; 
        }
        if (tags.length) {
            stream = T.stream('statuses/filter', { track: tags });
            stream.on('tweet', function(tweet) {
                users.generateData(tweet);
            });
        }
    }
};

module.exports = twitter;
var mongo = require('./mongo');
var ids = 0;
var usersArray = [];
var allTags = [];
mongo.getAllTags(function(err, tags){
    allTags = tags;
});


var users = {
    addUser: function () {
        var id = ++ids;
        usersArray[id] = {
            socket: null,
            tags: []
        };

        return id;
    },
    setSocket: function (userId, socket) {
        usersArray[userId].socket = socket;
    },
    addTags: function (userId, tags) {
        tags = tags.split(', ');
        mongo.getAllTags(function(err, databaseTags){
            allTags = databaseTags;
            var userTags = usersArray[userId].tags;
            databaseTags = databaseTags.map(function(tag) {
                if (userTags.indexOf(tag.name) !== -1) {
                    tag.used = true;
                }
                return tag;
            });

            var allTagsNames = databaseTags.map(function(obj) {
                return obj.name;
            });

            var tagsToAdd = [];
            for (var i = 0; i < tags.length; i++) {
                if (tags[i][0] === '#') {
                    tags[i] = tags[i].substr(1);
                }
                var currentTag = {
                    name: tags[i].toLowerCase(),
                    previousTwits: [],
                    languages: [],
                    languageRatios: {},
                    rate: 0
                };
                var userCurrentTag = {
                    name: tags[i].toLowerCase(),
                    previousTwits: [],
                    languages: [],
                    languageRatios: {},
                    rate: 0
                };
                if (userTags.indexOf(userCurrentTag) === -1 && tagsToAdd.indexOf(userCurrentTag) === -1) {
                    userCurrentTag.used = true;
                    userTags.push(userCurrentTag);
                }

                if (allTagsNames.indexOf(currentTag.name) === -1 && tagsToAdd.indexOf(currentTag) === -1) {
                    tagsToAdd.push(currentTag);
                }
            }
            if (tagsToAdd.length) {
                mongo.addTags(tagsToAdd, function(err, result){
                    console.log(result);
                });
            }
        });
    },
    generateData: function (tweet) {
        var that = this;
        mongo.getAllTags(function (err, tags) {
            if (err !== null) return false;
            for (var i = 0; i < tags.length; i++) {
                that.treatData(tags[i], tweet, 0);
            }
        });
    },
    treatData: function (tag, tweet, j) {
        if (!tweet.entities.hashtags[j]) return false;
        if (tag.name === tweet.entities.hashtags[j].text.toLowerCase()) {
            tag.previousTwits.push(tweet.timestamp_ms);

            var sum = 0;
            for (var id = 0; id < tag.previousTwits.length - 1; id++) {
                sum += tag.previousTwits[id + 1] - tag.previousTwits[id];
            }

            tag.rate = (60000 / (sum / (tag.previousTwits.length - 1))).toFixed(2);
            console.log(tag);

            if (tag.languages.length > 0) {
                for (var x = 0; x < tag.languages.length; x++) {
                    if (tag.languages[x].lang === tweet.lang) {
                        tag.languages[x].number++;
                        break;
                    }
                    else if (x === tag.languages.length - 1) {
                        tag.languages[1+x] = {
                            lang: tweet.lang,
                            number: 1
                        };
                    }
                    tag.languageRatios[tweet.lang] = (tag.languages[x].number / tag.previousTwits.length * 100).toFixed(2);
                }
            }
            else {
                tag.languages[0] = {
                    lang: tweet.lang,
                    number: 1
                };
            }
            this.storeAndBroadcast(tag);
        }
        if (j < tweet.entities.hashtags.length - 1) {
            this.treatData(tag, tweet, ++j);
        }
    },
    getUserTags: function (userId) {
        if (usersArray[userId]) {
            return usersArray[userId].tags;
        }
        else{
            return [];
        }
    },
    storeAndBroadcast: function (tag) {
        mongo.editTag(tag);
        for (var z = 0; z < usersArray.length; z++) {
            if (!usersArray[z]) continue;
            for (var a = 0; a < usersArray[z].tags.length; a++) {
                if (usersArray[z].tags[a].name === tag.name) {
                    usersArray[z].socket.emit('dataUpdate', tag);
                    break;
                }
            }
        }
    },
    unlinkTag: function (tagName, userId, callback) {
        mongo.getTagByName(tagName, function(err, mongoTag){
            var user = usersArray[userId];
            for (var i = 0; i < user.tags.length; i++) {
                if (user.tags[i].name === mongoTag.name) {
                    user.tags.splice(i, 1);
                    break;
                }
            }
            mongo.getAllTags(function (err, tags) {
                if (!err) {
                    callback(tags);
                }
            });
        });
    },
    linkTag: function (tagName, userId, callback) {
        mongo.getTagByName(tagName, function(err, tag){
            tag.used = true;
            usersArray[userId].tags.push(tag);
            mongo.getAllTags(function (err, tags) {
                if (!err) {
                    callback(tags);
                }
            });
        });
    }
};

module.exports = users;
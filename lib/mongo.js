var mongojs = require('mongojs');
var db = mongojs('dashboardTwitter', ['tags']);


exports.getAllTags = function (callback) {
    db.tags.find(function(err, tags){
        if (err) {
            callback(err);
        }
        else {
            callback(null, tags);
        }
    });
};

exports.addTags = function (tags, callback) {
    db.tags.insert(tags, function(err, result) {
        if (err) {
            callback(err);
        }
        else {
            callback(null, result);
        }
    });
};

exports.getTagByName = function (tagName, callback) {
    db.tags.findOne({name: tagName}, function(err, tag){
        if (err) {
            callback(err);
        }
        else {
            callback(null, tag);
        }
    });
};

exports.editTag = function (tag) {
    db.tags.findAndModify({
        query: { name: tag.name },
        update: { $set: {
            languages: tag.languages,
            previousTwits: tag.previousTwits,
            languageRatios: tag.languageRatios,
            rate: tag.rate
        } }
    }, function(err, result, lastErrorObject) {
        if (err) {
            console.log(err);
        }
    });
};
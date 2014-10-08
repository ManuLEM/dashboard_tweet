var users = require('../lib/users');
var mongo = require('../lib/mongo');
var twitter = require('../lib/twitter');

exports.getIndex = function (req, res) {

    var userId;
    if (req.session.userId) {
        userId = req.session.userId;
    }
    else {
        userId = req.session.userId = users.addUser();
    }

    var allTags = [];
    mongo.getAllTags(function(err, tags){
        var userTags = users.getUserTags(userId);
        tags = tags.map(function(tag) {
            for (var i = 0; i < userTags.length; i++) {
                if (userTags[i].name === tag.name) {
                    tag.used = true;
                }
            }
            return tag;
        });

        twitter.refresh(tags);

        res.render('home/index', {
            userId: userId,
            tags: tags
        });
    });
};

exports.addTags = function (req, res) {
    users.addTags(req.session.userId, req.body.tags);
    res.redirect('/');
};
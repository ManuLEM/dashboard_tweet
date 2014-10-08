var users = require('./users');
var twitter = require('./twitter');

module.exports = function (io) {
    io.sockets.on('connection', function (socket) {
        socket.on('auth', function (userId) {
            users.setSocket(userId, socket);
        });
        socket.on('toggleTagSelect', function (used, tagName, userId) {
            if (used === 'true') {
                users.unlinkTag(tagName, userId, function (tags) {
                    twitter.refresh(tags);
                });
            }
            else {
                users.linkTag(tagName, userId, function (tags) {
                    twitter.refresh(tags);
                });
            }
        });
    });
};
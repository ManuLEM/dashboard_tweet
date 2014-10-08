var home = require('./controllers/home');

function routes (app) {
    app.get('/', home.getIndex);
    app.post('/add-tags', home.addTags);
}

module.exports = routes;
var express = require('express');
var routes = require('./routes');
var expressLayouts = require('express-ejs-layouts');
var session = require('express-session');
var bodyParser = require('body-parser');

var app = express();

app.use(session({
    secret: 'ma super key super secrete'
}));

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.engine('html', require('ejs').__express);
app.set('view engine', 'html');
app.set('layout', 'layout');
app.set('views', __dirname + '/views');

app.use("/", express.static(__dirname + '/public'));

app.use(expressLayouts);

routes(app);

var server = app.listen(8080);
var io = require('socket.io').listen(server);

require('./lib/socket')(io);

require('./lib/twitter');
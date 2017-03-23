// modules =================================================
var express        = require('express');
var app            = express();
var mongoose       = require('mongoose');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var passport       = require('passport');
var flash          = require('connect-flash');
var morgan         = require('morgan');
var cookieParser   = require('cookie-parser');
var session        = require('express-session');
var MongoStore     = require('connect-mongo')(session);

// config files
var db = require('./config/db');
require('./config/passport')(passport);

// Export app base path
global['BASE_PATH'] = __dirname + '/';

// routes
var api = require('./app/routes/api');
var all = require('./app/routes/all');

var port = process.env.PORT || 8080; // set our port
mongoose.connect(db.url); // connect to our mongoDB database (commented out after you enter in your own credentials)

// get all data/stuff of the body (POST) parameters
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({type: 'application/vnd.api+json'})); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({extended: true})); // parse application/x-www-form-urlencoded

app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users

app.use(session({
  secret           : 'ilovescotchscotchyscotchscotch',
  resave           : false,
  saveUninitialized: false,
  name             : 'nemocookie',
  store            : new MongoStore({mongooseConnection: mongoose.connection})
}));

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ==================================================
// require('./app/routes')(app, passport); // pass our application into our routes
require(BASE_PATH + 'app/routes/auth')(app, passport);
app.use('/api', api);
app.use('/*', all);


// start app ===============================================
app.listen(port);
console.log('Magic happens on port ' + port); 			// shoutout to the user
exports = module.exports = app; 						// expose app
var config = require('../config/config');
var mdb    = require('moviedb')(config.key);
var Movie  = require('./models/Movie.js');
var User = require('./models/user');

var async  = require('async');

module.exports = function(app, passport){

  app.get('/api/movies', function(req, res){
    mdb.searchMovie({query: req.query.query}, function(err, result){
      console.log(result);
      async.eachOf(result.results, function(movie, index, cb){
        Movie.insertCast(movie, function(err, data){
          // console.log("Data is : ", data);
          result.results[index] = data;
          cb();
        });
      }, function(err){
        console.log("Sending response");
        res.send(result);
      });
    });
  });

  app.get('/api/popular-movies', function(re, res){
    mdb.miscPopularMovies({}, function(err, result){
      // console.log(result);
      async.eachOf(result.results, function(movie, index, cb){
        Movie.insertCast(movie, function(err, data){
          // console.log("Data is : ", data);
          result.results[index] = data;
          cb();
        });
      }, function(err){
        console.log("Sending response");
        res.send(result);
      });
    });
  });

  app.get('/auth/facebook', passport.authenticate('facebook', {scope: 'email'}));

  // handle the callback after facebook has authenticated the user
  app.get('/auth/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/', failureRedirect: '/'
  }));

  // route for logging out
  app.get('/auth/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });

  app.get("/loggedin", function(req, res) {
    console.log("In loggedin");
    res.send(req.isAuthenticated() ? req.user : '0');
  });

  app.get('/profile', isLoggedIn, function(req, res){
    console.log("Data : ", req.user);
    console.log("Req params : ", req.params);
    res.json(req.user);
  });

  app.post('/response', function(req, res){

    console.log("req.body : ", req.body);
    if(req.user) User.findOne({'_id' : req.user.id }, function(err, user){
      console.log("Found user ", user);
      if(err)
        res.fail(err);
      else {
        user.saveResponse(req.body);
        res.send('Done');
      }
    });
  });

  // frontend routes =========================================================
  // route to handle all angular requests
  app.get('/*', function(req, res){
    console.log("Req", req.isAuthenticated());
    console.log("Daata  : ", req.user);
    res.sendfile('./public/index.html');
  });
};

function isLoggedIn(req, res, next){
  // console.log("In isLogged in ");

  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
    return next();

  // if they aren't redirect them to the home page
  res.redirect('/');
}
var config = require('../config/config');
var mdb    = require('moviedb')(config.key);
var Movie  = require('./models/Movie.js');
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

  app.get('/auth/facebook', passport.authenticate('facebook', {scope: 'email'}));

  // handle the callback after facebook has authenticated the user
  app.get('/auth/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/profile', failureRedirect: '/'
  }));

  // route for logging out
  app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });

  app.get('/profile', require('connect-ensure-login').ensureLoggedIn(), function(req, res){
    // console.log("Doing something",res);
    console.log("Data : ", req.user);
    res.json(req.user);
    // res.sendfile('./public/index.html');
  });

  // frontend routes =========================================================
  // route to handle all angular requests
  app.get('/', function(req, res){
    console.log("Req", req.isAuthenticated());
    console.log("Daata  : ", req.user);
    res.send('./public/index.html');
  });
};

function isLoggedIn(req, res, next){
  console.log("In isLogged in ");

  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
    return next();

  // if they aren't redirect them to the home page
  res.redirect('/');
}
var config = require('../config/config');
var mdb    = require('moviedb')(config.key);
var Movie  = require('./models/Movie.js');
var async  = require('async');

module.exports = function(app){

  app.get('/api/movies', function(req, res){
    mdb.searchMovie({query: req.query.query}, function(err, result){
      console.log(result);
      async.eachOf(
        result.results,
        function(movie, index, cb){
          Movie.insertCast(movie, function(err, data){
            // console.log("Data is : ", data);
            result.results[index] = data;
            cb();
          });
        },
        function(err){
          console.log("Sending response");
          res.send(result);
        }
      );
    });
  });

  app.get('/api/popular-movies', function(re, res){
    mdb.miscPopularMovies({}, function(err, result){
      console.log(result);
      async.eachOf(
        result.results,
        function(movie, index, cb){
          Movie.insertCast(movie, function(err, data){
            // console.log("Data is : ", data);
            result.results[index] = data;
            cb();
          });
        },
        function(err){
          console.log("Sending response");
          res.send(result);
        }
      );
    });
  });
  // frontend routes =========================================================
  // route to handle all angular requests
  app.get('*', function(req, res){
    res.sendfile('./public/index.html');
  });

};
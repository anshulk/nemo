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
            console.log("Data is : ", data);
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

  app.post('/api/movies', function(req, res){
    mdb.searchMovie({query: 'Alien'}, function(err, result){
      //console.log(result);
      var r = result.results;
      for (var i in r) {
        console.log("R I : ", r[i]);
        var m = new Movie({'json': r[i]});
        m.save(function(err){
          if (!err) console.log("saved");
        });
      }
    });
  });

  // frontend routes =========================================================
  // route to handle all angular requests
  app.get('*', function(req, res){
    res.sendfile('./public/index.html');
  });

};
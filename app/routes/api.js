var config = require(BASE_PATH + 'config/config');
var User   = require(BASE_PATH + 'app/models/user');
var Movie  = require(BASE_PATH + 'app/models/Movie.js');

var mdb    = require('moviedb')(config.key);
var router = require('express').Router();
var async  = require('async');

var movies = function(req, res){
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
};

var popularMovies = function(req, res){
  console.log('Popular Movies page requested :', req.query.page);
  mdb.miscPopularMovies({'page': req.query.page}, function(err, result){
    console.log("Got total "+result.results.length+" popular movies");
    res.send(result);
  });
};

var credits = function(req, res){
  if(!req.query.movie_id) return res.status(502).json({ message : "Required field movie_id missing" });
  Movie.credits(req.query.movie_id, function(err, credits){
    if(err) return res.status(500).json({ message : "Oh Snap!" });
    if(!credits) return res.status(501).json({ message : "Got empty credits" });
    res.send(credits);
  });
};

// routes

router.get('/movies', movies);
router.get('/popular-movies', popularMovies);
router.get('/movie-credits', credits);

module.exports = router;

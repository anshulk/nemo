var config     = require('../../config/config');
var mdb        = require('moviedb')(config.key);
var _          = require('lodash');
module.exports = {
  insertCast: function(movie, cb){
    mdb.movieCredits({id: movie.id}, function(err, credits){
      movie.cast = credits.cast;
      cb(null, movie);
    });
  }
};
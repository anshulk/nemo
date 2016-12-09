var config     = require('../../config/config');
var mdb        = require('moviedb')(config.key);
var _          = require('lodash');
module.exports = {
  insertCast: function(movie, cb){
    var genres = {};
    movie.genre_ids.forEach(function(id){
      genres[id] = config.genres[id];
    });
    movie.genres = genres;
    mdb.movieCredits({id: movie.id}, function(err, credits){
      console.log("Credits are : ", credits);
      if(credits && credits.cast) movie.cast = credits.cast;
      cb(null, movie);
    });
  }
};
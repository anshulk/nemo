var config     = require(BASE_PATH + '/config/config');
var mdb        = require('moviedb')(config.key);
var _          = require('lodash');
module.exports = {
  insertCast: function(movie, cb){
    console.log("Insert cast called for movie id ", movie.id);
    var genres = {};
    movie.genre_ids.forEach(function(id){
      genres[id] = config.genres[id];
    });
    movie.genres = genres;
    mdb.movieCredits({id: movie.id}, function(err, credits){
      console.log("Got credits for movie id ", movie.id);
      if(credits && credits.cast) movie.cast = credits.cast;
      cb(null, movie);
    });
  },

  credits: function(id, cb){
    mdb.movieCredits({id: id}, function(err, credits){
      console.log("Got credits for movie id ", id);
      // console.log("Credits are : ", credits);
      cb(null, credits);
    });
  }
};
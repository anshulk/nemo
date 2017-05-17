module.exports = {
  insertCast: function(movie, cb){
    console.log("Insert cast called for movie id ", movie.id);
    var genres = {};
    movie.genre_ids.forEach(function(id){
      genres[id] = config.genres[id];
    });
    movie.genres = genres;
    mdb.movieCredits({id: movie.id}, function(err, credits){
      console.log("insert cast Got credits for movie id ", movie.id);
      if(credits && credits.cast) movie.cast = credits.cast;
      cb(null, movie);
    });
  },

  credits: function(id, cb){
    mdb.movieCredits({id: id}, function(err, credits){

      if( err || credits.length < 1) {
        console.log(" credits Error : ", err);
        credits = {};
      } else {
        console.log("Got credits for movie id ", id);
        credits.cast = credits.cast.splice(0,7);
        credits.crew = credits.crew.splice(0,3);
        // console.log("Credits are : ", credits);
      }
      cb(null, credits);
    });
  }
};

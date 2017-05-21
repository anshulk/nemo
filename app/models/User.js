// define the schema for our user model
var userSchema = mongoose.Schema({
  name: String, email: String, picture: String, facebook: {
    id: String, token: String, email: String, name: String, picture: String,
  },
  responses: [{movie_id: Number,  response: Number}],
  scores: { genre: [{id: Number, score: Number}],
            cast: [{id: Number, score: Number}],
            crew: [{id: Number, score: Number}],
            movie: [{id: Number, score: Number}],
          }
});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password){
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password){
  return bcrypt.compareSync(password, this.local.password);
};

userSchema.methods.saveResponse = function(response){
  var found = _.find(this.responses, {'movie_id' : response.movie.id });
  console.log("Found response : ", found);
  if(found){
    this.responses = _.map(this.responses, function(res){
      if(res.movie_id == response.movie.id){
        console.log("Editing response");
        res.response = response.response;
      }
      return res;
    });
  } else {
    console.log("Inserting response");
    this.responses.push({movie_id: response.movie.id, response: response.response});
  }

  console.log("Returning user after response");
  // this.save();
  return this;
};

userSchema.methods.editScores = function(response, callback){
  console.log("Editing scores...");
  var value = response.response > 0 ? 1 : -0.25; //Weightage for positive/negative values here
  var genre_ids = [];
  if(response.movie.genre_ids)
    genre_ids = response.movie.genre_ids;
  else
    genre_ids = _.map(response.movie.genres, 'id');

  this.editScore(this.scores.genre, genre_ids, value);
  this.editScore(this.scores.cast, _.map(response.movie.cast, 'id'), value);
  this.editScore(this.scores.crew, _.map(response.movie.crew, 'id'), value);
  var that = this;
  async.parallel({
    similar: function(cb) {
      mdb.movieSimilar({
        id: response.movie.id
      }, function(err, data) {
        var ids = _.map(data.results, 'id');
        cb(null, ids);
      })
    },
    recommend: function(cb) {
      mdb.movieRecommendations({
        id: response.movie.id
      }, function(err, data) {
        if (err) cb(err);
        else {
          var ids = _.map(data.results, 'id');
          cb(null, ids);
        }
      })
    }
  }, function(err, results){
     that.editScore(that.scores.movie, _.merge(results.similar, results.recommend), value);
     callback(null, that);
   }
  )
};

userSchema.methods.editScore = function(array, ids, value){
  console.log("Array : ", array);
  console.log("ids : ", ids);
  console.log("Value : ", value);
  ids.forEach(function(id){
    // console.log("Finding : ", {id: id});
    var found = _.find(array, {id: id});
    // console.log("Found score : ", found);
    if(found){
      array = _.map(array, function(score){
        if(score.id == id){
          // console.log("Editing score");
          score.score += value;
          // console.log("new score : ", score.score);
        }
        return score;
      });
    } else {
      // console.log("Inserting score");
      array.push({id: id, score: value});
    }
  })
};

userSchema.methods.getRecommendations = function(callback){
  var responded_movie_ids = _.map(this.responses, 'movie_id');
  console.log("responded_movie_ids : ", responded_movie_ids);
  var recs = _.reduce(this.scores.movie,
    function(list, entry){
      if ((entry.score > 2) && (responded_movie_ids.indexOf(entry.id) == -1))
        list.push(entry.id);
      return list;
    }, []
  );
  console.log("Recs : ", recs);
  if(recs) {
    async.map(recs, function(id, cb){
      mdb.movieInfo({id:id}, function(err, movie){
        cb(err, movie);
      })
    }, function(err, movies){
      callback(err, movies);
    })
  } else {
    callback(null, []);
  }

}

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema)

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

var response = function(req, res){
  console.log("api/response req.body : ", req.body);
  if (req.user) User.findOne({'_id': req.body.user_id}, function(err, user){
    if (user) console.log("Found user ");
    if (err)
      res.send(err); else {
      user.saveResponse(req.body);
      user.editScores(req.body, function(err, that){
        that.save();
        console.log("user object saved");
        res.send('Done');
      });
    }
  });
};

var recommendations = function(req, res){
  console.log("Recommendations req query : ", req.query);
  if (req.query.user_id) User.findOne({'_id': req.query.user_id}, function(err, user){
    if (user)console.log("Found user ");
    if (err) res.send(err);
    else {
      user.getRecommendations(function(err, movies){
        if (err) res.send(err);
        else res.json({ results: movies });
      });
    }
  });
  else res.send("No user");
}

// routes

router.get('/movies', movies);
router.get('/popular-movies', popularMovies);
router.get('/movie-credits', credits);
router.get('/recommendations', recommendations);
router.post('/response', response);

module.exports = router;

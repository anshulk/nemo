var Movie = require('./models/Movie.js');
var mdb   = require('moviedb')('5957e53f1b383aa9112069754a87cd3f');

module.exports = function(app){

  app.get('/api/movies', function(req, res){
    mdb.searchMovie({query: req.query.query}, function(err, result){
      res.send(result);
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
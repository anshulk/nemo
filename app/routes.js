var Nerd = require('./models/Nerd.js');
var Movie = require('./models/Movie.js');

var mdb = require('moviedb')('5957e53f1b383aa9112069754a87cd3f');

module.exports = function(app) {

	// server routes ===========================================================
	// handle things like api calls
	// authentication routes

	// sample api route
	app.get('/api/nerds', function(req, res) {
		// use mongoose to get all nerds in the database
		Nerd.find(function(err, nerds) {

			// if there is an error retrieving, send the error.
			// nothing after res.send(err) will execute
			if (err)
				res.send(err);

			res.json(nerds); // return all nerds in JSON format
		});
	});

	app.post('/api/nerds', function(req, res){

		var n = new Nerd({name : 'Anshul'});

		n.save(function (err) {
			if (err) {
				console.log(err);
			} else {
				console.log('saved');
			}
		});

	});

	app.get('/api/movies', function(req, res){
		// Movie.find(function(err, result){
		// 	console.log(result);
		// 	res.send(result);
		// })

		mdb.searchMovie({query: 'Alien' }, function(err, result){
			res.send(result);
		});

	});

	app.post('/api/movies', function(req, res){
		mdb.searchMovie({query: 'Alien' }, function(err, result){
			//console.log(result);
			var r = result.results;
			for( var i in r){
				console.log("R I : ", r[i]);
				var m = new Movie({ 'json' : r[i]});
				m.save(function(err){
					if(!err) console.log("saved");
				});
			}
		});
	})

	// frontend routes =========================================================
	// route to handle all angular requests
	app.get('*', function(req, res) {
		res.sendfile('./public/index.html');
	});

};

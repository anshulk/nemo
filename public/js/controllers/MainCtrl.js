angular.module('MainCtrl', ['jkAngularRatingStars']).controller('MainController', function($scope, $http, _) {

  $scope.searchWithQuery = function(query) {
    // var query = $scope.query;
    console.log("Query : ", query);
    $http.get('/api/movies', {
      params: {
        query: query
      }
    }).then(function(data) {
      $scope.movies = data.data.results;
      console.log($scope.movies);
    }, function(err) {
      console.log(err);
    });
  };

  $scope.getPopularMovies = function() {
    $scope.moviesRequestedForPage = (+$scope.currentPage + 1);
    console.log("Getting popular movies page ", (+$scope.currentPage + 1));

    var user_id_string = $scope.currentUser ? '&user_id=' + $scope.currentUser._id : '';
    $http.get('/api/popular-movies?page=' + (+$scope.currentPage + 1) + user_id_string).then(function(data) {
      console.log(data);
      $scope.currentPage = data.data.page;
      $scope.remainingMovies += data.data.results.length;
      $scope.movies = $scope.movies.concat(data.data.results);
      $scope.filterMovies();
      if ($scope.movies.length > 0) {
        if ($scope.movies.length) $scope.getCredits($scope.movies[0].id);
        if ($scope.movies.length > 1) $scope.getCredits($scope.movies[1].id);
        $scope.m = $scope.movies[0];
        console.log("currentPage : ", $scope.currentPage);
        console.log("$scope.remainingMovies : ", $scope.remainingMovies);
        console.log($scope.movies);
        console.log("M is now  :", $scope.m);
        $scope.getRecommendations();
      }
    }, function(err) {
      console.log(err);
    });
  };

  $scope.filterMovies = function() {
    if (!$scope.currentUser)
      return;
    var responded_movie_ids = _.map($scope.currentUser.responses, 'movie_id');
    // console.log("responded_movie_ids : ", responded_movie_ids);
    $scope.movies = _.filter($scope.movies, function(movie) {
      // console.log(movie.id, responded_movie_ids.indexOf(movie.id) < 0);
      return responded_movie_ids.indexOf(movie.id) < 0
    });
    // console.log("Filtered movies : ", $scope.movies);
    $scope.m = $scope.movies[0];
    $scope.remainingMovies = $scope.movies.length;
    if ($scope.remainingMovies < 5) {
      $scope.getPopularMovies();
    }
  };

  $scope.getCredits = function(movie_id) {
    console.log("get credits called for ", movie_id);
    if (!movie_id) return;
    $http.get('/api/movie-credits?movie_id=' + movie_id)
      .then(function(data) {
        if (!data.data.cast) return;
        console.log("Got credits for id : ", data.data.id);
        var index = _.findIndex($scope.movies, {
          'id': data.data.id
        });
        // console.log("Index : ", index);
        if (index > -1) $scope.movies[index] = _.merge($scope.movies[index], data.data);
        // console.log("Merged : ", $scope.movies[index]);

        var index = _.findIndex($scope.recommendations, {
          'id': data.data.id
        });
        if (index > -1) $scope.recommendations[index] = _.merge($scope.recommendations[index], data.data);

        if ($scope.m.id == data.data.id)
          $scope.m = _.merge($scope.m, data.data);

        $(function() {
          $('.tooltipped').tooltip({
            delay: 5
          });
        });
        // $scope.$apply();
      })
  };

  $scope.respond = function(data) {
    $scope.responding = true;
    console.log("Respond data : ", data);
    var res_code = data.type == 'like' ? 1 : -1;
    console.log("Movies : ", $scope.movies);
    console.log("Recommendations : ", $scope.recommendations);
    var all_movies = ($scope.movies, $scope.recommendations);
    var movie = {};

    var index = _.findIndex($scope.movies, {
      'id': data.movie_id
    });

    if (index == -1) {
      index = _.findIndex($scope.recommendations, {
        'id': data.movie_id
      });
      movie = $scope.recommendations[index];
    } else {
      movie = $scope.movies[index];
    }

    console.log("Found movie : ", movie);
    $http.post('/api/response', {
        movie: movie,
        response: res_code,
        user_id: $scope.currentUser._id
      })
      .then(function(data) {
        if (!$scope.showing_recommendations) {
          console.log("Response request : ", data, " m is :", $scope.m);
          $scope.remainingMovies--;
          console.log("Remaining Movies : ", $scope.remainingMovies);

          if ($scope.remainingMovies < 5 && ($scope.moviesRequestedForPage < ($scope.currentPage + 1))) {
            $scope.getPopularMovies();
          }
          $scope.getCredits($scope.movies[2].id);
          $scope.movies.shift();
          $scope.m = $scope.movies[0];
          console.log("M is now  :", $scope.m);
        } else {
          $scope.recommendations.shift();
          if ($scope.recommendations.length < 1)
            $scope.toggleRecommendations();
          else {
            $scope.m = $scope.recommendations[0];
            console.log("M is now  :", $scope.m);
          }
        }
        $scope.getRecommendations();
        $scope.responding = false;
      }, function(err) {
        $scope.responding = false;
        console.log("Error ", err);
      });
  };

  $scope.setVariables = function() {
    $scope.remainingMovies = 0;
    $scope.currentPage = 0;
    $scope.moviesRequestedForPage = 0;
    $scope.movies = [];
    $scope.recommendations = [];
    $scope.top_movie = {};
    $scope.showing_recommendations = false;
    $scope.genres = {
      10402: "Music",
      10749: "Romance",
      10751: "Family",
      10752: "War",
      10770: "TV Movie",
      12: "Adventure",
      14: "Fantasy",
      16: "Animation",
      18: "Drama",
      27: "Horror",
      28: "Action",
      35: "Comedy",
      36: "History",
      37: "Western",
      53: "Thriller",
      80: "Crime",
      878: "Science Fiction",
      9648: "Mystery",
      99: "Documentary"
    }
  };

  $scope.getRecommendations = function() {
    if (!$scope.currentUser) {
      return;
    } else $http.get('/api/recommendations?user_id=' + $scope.currentUser._id)
      .then(function(data) {
        var old_recoms_ids = _.map($scope.recommendations, 'id')
        console.log("Recoms data : ", data, "ids : ", old_recoms_ids);
        if (data.data.results.length > 0) {
          console.log("New recoms : ", data.data.results, _.map(data.data.results, 'id'));

          var new_recoms = _.reduce(data.data.results,
            function(list, movie) {
              if (old_recoms_ids.indexOf(movie.id) == -1) {
                list.push(movie);
              }
              return list;
            }, []
          );
          console.log("Filtered new recoms : ", new_recoms, _.map(new_recoms, 'id'));

          $scope.recommendations.push.apply($scope.recommendations, new_recoms);
          console.log("Recommendations length : ", $scope.recommendations.length);
          $scope.getCredits($scope.recommendations[0].id);
          if ($scope.recommendations.length > 1) $scope.getCredits($scope.recommendations[1].id);
        }
      });
  };

  $scope.toggleRecommendations = function() {
    if (!$scope.currentUser) {
      $(function() {
        Materialize.toast('Login to get recommendations!', 4000);
      });
      return;
    } else if (!$scope.showing_recommendations && $scope.recommendations.length < 1) {
      $(function() {
        Materialize.toast('Like a few more!', 4000);
      });
    } else {
      if (!$scope.showing_recommendations) {
        if (!$scope.responding) $scope.old_m = $scope.m;
        if ($scope.old_recom) {
          $scope.m = $scope.old_recom;
        } else {
          $scope.m = $scope.recommendations[0];
        }
      } else {
        if (!$scope.responding) $scope.old_recom = $scope.m;
        $scope.m = $scope.old_m;
      }
      $scope.showing_recommendations = !$scope.showing_recommendations;
      if ($scope.showing_recommendations) {
        $(function() {
          Materialize.toast('Showing recommendations!', 2000);
        });
      } else {
        $(function() {
          Materialize.toast('Showing popular movies!', 2000);
        });
      }
    }

  }

  $scope.init = function() {
    $scope.setVariables();
    $scope.getPopularMovies();
    $scope.getRecommendations();
    // $scope.searchWithQuery("Nemo");
  };

});

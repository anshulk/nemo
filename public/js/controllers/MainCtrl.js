angular.module('MainCtrl', ['jkAngularRatingStars']).controller('MainController', function($scope, $http, _){

  $scope.searchWithQuery = function(query){
    // var query = $scope.query;
    console.log("Query : ", query);
    $http.get('/api/movies', {params: {query: query}}).then(function(data){
      $scope.movies = data.data.results;
      console.log($scope.movies);
    }, function(err){
      console.log(err);
    });
  };

  $scope.getPopularMovies = function(){
    $scope.moviesRequestedForPage = (+$scope.currentPage + 1);
    console.log("Getting popular movies page ", (+$scope.currentPage + 1) );

    var user_id_string = $scope.currentUser ? '&user_id=' + $scope.currentUser._id : '';
    $http.get('/api/popular-movies?page=' + (+$scope.currentPage + 1)+ user_id_string).then(function(data){
      console.log(data);
      $scope.currentPage = data.data.page;
      $scope.remainingMovies += data.data.results.length;
      $scope.movies      = $scope.movies.concat(data.data.results);
      $scope.filterMovies();
      if( $scope.movies.length > 0){
        if ($scope.movies.length) $scope.getCredits($scope.movies[0].id);
        if ($scope.movies.length > 1) $scope.getCredits($scope.movies[1].id);
        $scope.m = $scope.movies[0];
        console.log("currentPage : ", $scope.currentPage);
        console.log("$scope.remainingMovies : ", $scope.remainingMovies);
        console.log($scope.movies);
        console.log("M is now  :" , $scope.m);
      }
    }, function(err){
      console.log(err);
    });
  };

  $scope.filterMovies = function(){
    if(!$scope.currentUser)
      return;
    var responded_movie_ids = _.map($scope.currentUser.responses, 'movie_id');
    // console.log("responded_movie_ids : ", responded_movie_ids);
    $scope.movies = _.filter($scope.movies, function(movie) {
      // console.log(movie.id, responded_movie_ids.indexOf(movie.id.toString()) < 0);
      return responded_movie_ids.indexOf(movie.id.toString()) < 0
    });
    // console.log("Filtered movies : ", $scope.movies);
    $scope.m = $scope.movies[0];
    $scope.remainingMovies = $scope.movies.length;
    if ($scope.remainingMovies < 5) {
      $scope.getPopularMovies();
    }
  };

  $scope.getCredits = function(movie_id){
    console.log("get credits called for ", movie_id);
    if (!movie_id) return;
    $http.get('/api/movie-credits?movie_id=' + movie_id)
      .then(function(data){
        if(!data.data.cast) return;
        console.log("Got credits : ", data);
        var index = _.findIndex($scope.movies, { 'id' : data.data.id} );
        console.log("Index : ", index);
        $scope.movies[index] = _.merge($scope.movies[index], data.data);
        console.log("Merged : ", $scope.movies[index]);

        $(function () {
                  $('.tooltipped').tooltip({delay: 5});
              });
        // $scope.$apply();
      })
  };

  $scope.respond = function(data){
    console.log("Respond data : ", data);
    var res_code = data.type == 'like' ? 1 : -1;

    $http.post('/response', {movie_id: data.movie_id, response: res_code, user: $scope.currentUser})
      .then(function(data){
        console.log("Response request : ", data, " m is :", $scope.m );
        $scope.remainingMovies--;
        console.log("Remaining Movies : ", $scope.remainingMovies);

        if ($scope.remainingMovies < 5 && ($scope.moviesRequestedForPage < ($scope.currentPage + 1))) {
          $scope.getPopularMovies();
        }
        $scope.getCredits($scope.movies[2].id);
        $scope.movies.shift();
        $scope.m = $scope.movies[0];
        console.log("M is now  :" , $scope.m);
      }, function(err){
        console.log("Error ", err);
      });
  };

  $scope.setVariables = function(){
    $scope.remainingMovies        = 0;
    $scope.currentPage            = 0;
    $scope.moviesRequestedForPage = 0;
    $scope.movies                 = [];
    $scope.top_movie = {};
    $scope.genres = {
      10402: "Music",
      10749: "Romance",
      10751: "Family",
      10752: "War",
      10770: "TV Movie",
      12   : "Adventure",
      14   : "Fantasy",
      16   : "Animation",
      18   : "Drama",
      27   : "Horror",
      28   : "Action",
      35   : "Comedy",
      36   : "History",
      37   : "Western",
      53   : "Thriller",
      80   : "Crime",
      878  : "Science Fiction",
      9648 : "Mystery",
      99   : "Documentary"
    }
  };

  $scope.init = function(){
    $scope.setVariables();
    $scope.getPopularMovies();
    // $scope.searchWithQuery("Nemo");
  };

  $scope.LetsPlay = function(e){
    var movie_id           = e.target.attributes.movie.value;
    var status             = e.target.attributes.status.value;
    var visible_card       = e.toElement.offsetParent.parentNode;
    var visible_card_index = visible_card.getAttribute("card-index");
    var arriving_card      = document.querySelectorAll("[card-index='" + (parseInt(visible_card_index) + 1) + "']");
    var onhold_card        = document.querySelectorAll("[card-index='" + (parseInt(visible_card_index) + 2) + "']");
    var load_card          = document.querySelectorAll("[card-index='" + (parseInt(visible_card_index) + 3) + "']");

    if (status == 'like') {
      angular.element(visible_card).removeClass('visible').addClass('liked');
      setTimeout(function(){
        angular.element(visible_card).addClass('hide');
        angular.element(arriving_card).removeClass('arriving').addClass('visible');
        angular.element(onhold_card).removeClass('onhold').addClass('arriving');
        angular.element(load_card).removeClass('hide').addClass('onhold');
      }, 600);
    } else {
      angular.element(visible_card).removeClass('visible').addClass('ignored');
      setTimeout(function(){
        angular.element(visible_card).addClass('hide');
        angular.element(arriving_card).removeClass('arriving').addClass('visible');
        angular.element(onhold_card).removeClass('onhold').addClass('arriving');
        angular.element(load_card).removeClass('hide').addClass('onhold');
      }, 600);
    }
  }
});

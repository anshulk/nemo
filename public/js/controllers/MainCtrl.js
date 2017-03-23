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
    $http.get('/api/popular-movies?page=' + (+$scope.currentPage + 1)).then(function(data){
      console.log(data);
      $scope.currentPage = data.data.page;
      $scope.remainingMovies += data.data.results.length;
      $scope.movies      = $scope.movies.concat(data.data.results);
      $scope.m = $scope.movies[0];
      console.log("currentPage : ", $scope.currentPage);
      console.log("$scope.remainingMovies : ", $scope.remainingMovies);
      console.log($scope.movies);
      console.log("M is now  :" , $scope.m);
    }, function(err){
      console.log(err);
    });
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
        // $scope.$apply();
      })
  };

  $scope.respond = function(data){
    console.log("Respond data : ", data);
    var res_code = data.type == 'like' ? 1 : -1;
    $scope.remainingMovies--;
    console.log("Remaining Movies : ", $scope.remainingMovies);

    if ($scope.remainingMovies < 5 && ($scope.moviesRequestedForPage < ($scope.currentPage + 1))) {
      $scope.getPopularMovies();
    }

    $http.post('/response', {movie_id: data.movie_id, response: res_code})
      .then(function(data){
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
  };

  $scope.init = function(){
    console.log(_.range(1, 10));
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

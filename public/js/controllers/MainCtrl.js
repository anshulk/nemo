angular.module('MainCtrl', ['jkAngularRatingStars']).controller('MainController', function($scope, $http){

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
    $http.get('/api/popular-movies').then(function(data){
      $scope.movies = data.data.results;
      // console.log($scope.movies);
    }, function(err){
      console.log(err);
    });
  };

  $scope.respond = function(data){
    console.log(data);
    var res_code = data.type == 'like' ? 1 : -1;

    $http.post('/response', {movie_id: data.movie_id, response: res_code})
      .then(function(data){
        console.log(data);
      }, function(err){
        console.log("Error ", err);
      });
  };

  $scope.init = function(){
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

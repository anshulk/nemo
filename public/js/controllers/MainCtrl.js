angular.module('MainCtrl', ['jkAngularRatingStars']).controller('MainController', function($scope, $http){

  $scope.searchWithQuery = function(query){
		// var query = $scope.query;
    console.log("Query : ", query);
    $http.get(
      '/api/movies',
      { params : { query : query}}
    ).then(function(data){
      $scope.movies = data.data.results;
      console.log($scope.movies);
    }, function(err){
      console.log(err);
    });
  };

  $scope.init = function(){
    $scope.searchWithQuery("Kung Fu Panda");
  }
  $scope.init = function(){
    $scope.searchWithQuery('jason');
  }
  $scope.like = function(e){
    var movie_id = e.target.attributes.movie.value;
    var status = e.target.attributes.status.value;
    var visible_card = e.toElement.offsetParent.parentNode;
    var visible_card_index = visible_card.getAttribute("card-index");
    var arriving_card = document.querySelectorAll("[card-index='"+(parseInt(visible_card_index)+1)+"']");
    var onhold_card = document.querySelectorAll("[card-index='"+(parseInt(visible_card_index)+2)+"']");
    var load_card = document.querySelectorAll("[card-index='"+(parseInt(visible_card_index)+3)+"']");
    angular.element(visible_card).removeClass('visible').addClass('hide');
    angular.element(arriving_card).removeClass('arriving').addClass('visible');
    angular.element(onhold_card).removeClass('onhold').addClass('arriving');
    angular.element(load_card).removeClass('hide').addClass('onhold');
  }
});

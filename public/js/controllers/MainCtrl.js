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

});
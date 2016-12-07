angular.module('MainCtrl', ['jkAngularRatingStars']).controller('MainController', function($scope, $http) {

	$scope.tagline = 'To the moon and back!';

	$scope.init1 = function(){
		$scope.movies = 'Test';
	};

	$scope.init = function(){
		console.log("Trying to get movies");
		$http.get('/api/movies').then( function(data){
			$scope.movies = data.data;
			console.log($scope.movies);
		}, function(err){
			console.log(err);
		});
	}

});

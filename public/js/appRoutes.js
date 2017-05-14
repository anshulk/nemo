angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', '$httpProvider', function($routeProvider, $locationProvider, $httpProvider){

  $routeProvider

  // home page
    .otherwise({
      templateUrl: 'views/movies_anshul.html', controller: 'MainController', resolve: {
        logincheck: checkLoggedin
      }
    });

  $locationProvider.html5Mode(true);
}]);

var checkLoggedin = function($q, $timeout, $http, $location, $rootScope){
  var deferred = $q.defer();
  console.log("In checkLoggedIn frontend");
  $http.get('/loggedin').then(function(data){
    var user = data.data;
    console.log("User ", user);
    $rootScope.errorMessage = null;
    //User is Authenticated
    if (user !== '0') {
      $rootScope.currentUser = user;
    }
    deferred.resolve();
  });
  return deferred.promise;
};

angular.module('nemoApp', ['ngRoute', 'appRoutes', 'MainCtrl'])
  .factory('_', ['$window',
    function($window) {
      // place lodash include before angular
      return $window._;
    }
  ]);
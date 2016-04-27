var myApp = angular.module('technicApp', ['ngRoute']);

myApp.config(function($routeProvider){
    $routeProvider
    .when('/', {
        templateUrl: 'templates/login.html',
        controller: 'loginCtrl'
    })
    .when('/home', {
        templateUrl: 'templates/home.html',
        controller: 'homeCtrl'
    });
});

myApp.value('myVars', {'user_id': undefined});

myApp.controller('loginCtrl', ['myVars', '$scope', '$location', '$http', function (myVars, $scope, $location, $http) {
    $scope.message = 'login';

    // EVENT CLICK LOGIN
    $scope.login = function($event) {
      var user_name = $('#username').val();
      $http.get('/login/'+user_name).success(function(response){
            // REDIRECT TO HOME
            myVars.user_id = response;
            console.log('user_id: ', myVars);
            $location.path("/home");
      });

    };
}]);

myApp.controller('homeCtrl', ['myVars','$scope', '$location', '$http', function (myVars, $scope, $location, $http) {
    if (!myVars.user_id) {
        $location.path("/");
    }

    $scope.message = myVars.user_id;
    var user_id = myVars.user_id;
    $http.get('/topics/'+user_id).success(function(response){
        console.log('response ',response);
        $scope.topics = response;
    });



}]);

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
    }).
    when('/new/message', {
        templateUrl: 'templates/newMessage.html',
        controller: 'newMessageCtrl'
    }).
    otherwise({
        redirectTo: '/'
    });
});

myApp.value('myVars', {'user_id': undefined});

var verifyLogin = function(myVars, $location){
    if (!myVars.user_id) {
        $location.path("/");
    }
}

myApp.controller('loginCtrl', ['myVars', '$scope', '$location', '$http', function (myVars, $scope, $location, $http) {
    $scope.message = 'login';

    // EVENT CLICK LOGIN
    $scope.login = function($event) {
      var user_name = $('#username').val();
      $http.get('/login/'+user_name).success(function(response){
            // REDIRECT TO HOME
            myVars.user_id = response;
            $location.path("/home");
      });

    };
}]);

myApp.controller('homeCtrl', ['myVars','$scope', '$location', '$http', function (myVars, $scope, $location, $http) {

    var refreshMyTopics = function(user_id){
        $http.get('/topic/'+user_id).success(function(response){
            $scope.topics = response;
        });
    }

    var refreshSubTopic = function(user_id){
        $http.get('/topic/subscribe/'+user_id).success(function(response){
            $scope.sub_topics = response;
            refreshMyTopics(user_id);
            refreshTopics(user_id);
        });
    }

    var refreshTopics = function(user_id){
        $http.get('/get_topics/'+user_id). success(function(response){
            $scope.messages = response;
        });
    }

    verifyLogin(myVars, $location);

    $scope.message = myVars.user_id;
    $scope.comment_active = false;
    var user_id = myVars.user_id;

    refreshMyTopics(user_id);
    refreshSubTopic(user_id);
    refreshTopics(user_id);

    $scope.AddTopic = function(){
        var subTopic = {
            'user_id': user_id,
            'topic_id': $scope.subTopic.topic_id
        };

        $http.post('/topic/subscribe', subTopic).success(function(response){
            if(response) refreshSubTopic(user_id);
        });
    };

    $scope.AddComment = function(){
        $scope.comment_active = true;
    }


}]);

myApp.controller('newMessageCtrl',  ['myVars', '$scope', '$location', '$http', function(myVars, $scope, $location, $http){
    verifyLogin(myVars, $location);
    var user_id = myVars.user_id;
    $http.get('/topic/'+user_id).success(function(response){
        $scope.topics = response;
    });

    $scope.newMessage = function() {
        var message = {
            'topic_id': parseInt($scope.newMessage.topic),
            'user_id': user_id,
            'mensaje': $scope.newMessage.message,
            'title': $scope.newMessage.title
        }
        $http.post('/new_message', message).success(function(response){
            if(response){
                alert('Exito!');
                $scope.newMessage = '';
                $location.path("/home");
            }
        });
    }
}]);

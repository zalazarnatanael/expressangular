var myApp = angular.module('technicApp', ['ngRoute', 'underscore']);

var underscore = angular.module('underscore', []);
underscore.factory('_', ['$window', function($window) {
  return $window._; // assumes underscore has already been loaded on the page
}]);

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

myApp.value('user_data', {});

var verifyLogin = function(user_data, $location){
    if (!user_data.id) {
        $location.path("/");
    }
};

myApp.controller('loginCtrl', ['user_data', '$scope', '$location', '$http', '_', function (user_data, $scope, $location, $http, _) {
    // EVENT CLICK LOGIN
    $scope.login = function($event) {
      var user_name = $('#username').val();
      $http.get('/login/'+user_name).success(function(response){
            // REDIRECT TO HOME
            _.extend(user_data, response);
            $location.path("/home");
      });
    };
}]);

myApp.controller('homeCtrl', ['user_data','$scope', '$location', '$http', '_', function (user_data, $scope, $location, $http, _) {

    var refreshMyTopics = function(user_id){
        $http.get('/topic/'+user_id).success(function(response){
            $scope.topics = response;
        });
    };

    var refreshSubTopic = function(user_id){
        $http.get('/topic/subscribe/'+user_id).success(function(response){
            $scope.sub_topics = response;

            refreshMyTopics(user_id);
            refreshTopics(user_id);
        });
    };

    var refreshTopics = function(user_id){
        $http.get('/get_messages/'+user_id). success(function(response){
            $scope.messages = response;
        });
    };

    verifyLogin(user_data, $location);

    $scope.username = user_data.name;
    $scope.comment_active = false;
    var user_id = user_data.id;

    refreshMyTopics(user_id);
    refreshSubTopic(user_id);
    refreshTopics(user_id);

    $scope.AddTopic = function(){
        var subTopic = {
            'user_id': user_id,
            'topic_id': $scope.subTopic.topic_id
        };

        $http.post('/topic/subscribe', subTopic).success(function(response){
            if(response) {
                refreshSubTopic(user_id);
                $scope.TreeController.refreshMessages(user_id,$http,$scope);
            }
        });
    };
}]);

myApp.controller("TreeController", ['$scope', '$http', 'user_data', function($scope, $http, user_data) {
    var user_id = user_data.id;

    var refreshMessages = function(user_id, $http, $scope) {
        $http.get('/get_messages/'+user_id). success(function(response){
            var tree = [];
            var auxTree = {}; //Keeps track of nodes using id as key, for fast lookup

            //loop over data
            for(var i = 0; i < response.length; i++) {
                var datum = response[i];

                //each node will have children, so let's give it a "children" poperty
                datum.nodes = [];

                //add an entry for this node to the map so that any future children can
                //lookup the parent
                auxTree[datum.id] = datum;

                if(!_.isNull(datum.message_id)){
                    //This node has a parent, so let's look it up using the id
                    parentNode = auxTree[datum.message_id];


                    //Let's add the current node as a child of the parent node.
                    parentNode.nodes.push(datum);
                }
            }
            _.forEach(auxTree, function(root){
                if(_.isNull(root.message_id)) {
                    _.extend(root, {'comment_active': false});
                    tree.push(root);
                }
            });

            $scope.tree = tree;
        });
    };

    refreshMessages(user_id,$http,$scope);

    $scope.ShowAddComment = function(branch){
        branch.comment_active = !branch.comment_active;
    };

    $scope.AddComment = function(message, branch){
        branch.comment_active = false;

        var data = {
            'topic_id': branch.topic_id,
            'user_id': user_id,
            'mensaje': message,
            'title': branch.title,
            'message_id': branch.id
        };
        $http.post('/new_message', data).success(function(response){
            if(response){
                refreshMessages(user_id,$http,$scope);
                message = '';
            }
        });
    };

    $scope.CloseComment = function(branch){
        branch.comment_active = false;
    };
}]);

myApp.controller('newMessageCtrl',  ['user_data', '$scope', '$location', '$http', function(user_data, $scope, $location, $http){
    verifyLogin(user_data, $location);
    var user_id = user_data.id;
    $scope.username = user_data.name;
    $http.get('/topic/'+user_id).success(function(response){
        $scope.topics = response;
    });

    $scope.newMessage = function() {
        var message = {
            'topic_id': parseInt($scope.newMessage.topic),
            'user_id': user_id,
            'mensaje': $scope.newMessage.message,
            'title': $scope.newMessage.title,
            'message_id': null
        };
        $http.post('/new_message', message).success(function(response){
            if(response){
                $scope.newMessage = '';
                $location.path("/home");
            }
        });
    };
}]);

var ref = new Firebase("https://quickchat-c333d.firebaseio.com/");


function IDGenerator() {
	 
	this.length = 8;
	this.timestamp = +new Date;

	var _getRandomInt = function( min, max ) {
		return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
	}

	this.generate = function() {
		var ts = this.timestamp.toString();
		var parts = ts.split( "" ).reverse();
		var id = "";

		for( var i = 0; i < this.length; ++i ) {
		var index = _getRandomInt( 0, parts.length - 1 );
		id += parts[index];	 
	}

	return id;
}


}
var generator = new IDGenerator();
var meId = generator.generate();
var myName = null;






var app = angular.module('firebaseApp', ['ngRoute', 'ngAnimate']);

app.controller('FireBaseCtrl', function($scope, $route, $routeParams, $location) {

	$scope.params = $routeParams;

	$scope.roomId = $routeParams.roomId;

	$scope.allChatsMessages = {
		anime: [],
		any: [],
		developers: [],
		sports: [],
		technology: [],
		tvseries: []
	};

	var updateChat = function(snapshot) {
		//var list = angular.element(jQuery("#chat"));
		
		var current = snapshot.val();

		if(current.text) {
			$scope.allChatsMessages[current.room].push({
				owner: current.me.id == meId ? 'me' : 'other',
				user: current.me.name,
				text: current.text
			});
		}
	}

	ref.child("anime").on("value", updateChat);
	ref.child("any").on("value", updateChat);
	ref.child("developers").on("value", updateChat);
	ref.child("sports").on("value", updateChat);
	ref.child("technology").on("value", updateChat);
	ref.child("tvseries").on("value", updateChat);

	
	$scope.textMessage = "";

	$scope.template = 'templates/login.html';

	$scope.go = function(url) {
		$location.path(url);
	};
	
	this.login = function() {
		
		if(this.nickname) {
			myName = this.nickname;
			
			$scope.go('/rooms');
		}
	};

	$scope.logout = function() {
		$scope.go('/');
	};

	$scope.send = function() {
		if($routeParams.roomId && $scope.textMessage && myName) {
			ref.child($routeParams.roomId).set({
				me: {id: meId, name: myName},
				room: $routeParams.roomId,
				text: $scope.textMessage
			});
			$scope.textMessage = "";
		} else {
			$scope.logout();
		}
		
	};

	$scope.classBody = function() {
		return $scope.params.roomId ? 'bg-chat bg-'+$scope.params.roomId : '';
	};

});


app.config(function($routeProvider, $locationProvider) {

	//------------ Home -----------------------------
	$routeProvider.when('/', {
		templateUrl: 'templates/login.html',
		controller: 'FireBaseCtrl',
		resolve: {
			// I will cause a 1 second delay
			delay: function($q, $timeout) {
				var delay = $q.defer();
				$timeout(delay.resolve, 1000);
				return delay.promise;
			}
		}
	});

	//------------ Chat rooms -----------------------------
	$routeProvider.when('/rooms', {
		templateUrl: 'templates/chat_rooms.html',
		controller: 'FireBaseCtrl',
		resolve: {
			// I will cause a 1 second delay
			delay: function($q, $timeout) {
				var delay = $q.defer();
				$timeout(delay.resolve, 1000);
				return delay.promise;
			}
		}
	});

	//------------ Chat -----------------------------
	$routeProvider.when('/room/:roomId', {
		templateUrl: 'templates/room.html',
		controller: 'FireBaseCtrl',
		resolve: {
			// I will cause a 1 second delay
			delay: function($q, $timeout) {

			}
		}
	});

});





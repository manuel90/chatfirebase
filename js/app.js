var ref = new Firebase("https://quickchat-c333d.firebaseio.com/");

Object.defineProperty(window, 'KEY_ENTER', {
	value: 13
});

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

var app = angular.module('firebaseApp', ['ngRoute', 'ngAnimate', 'firebase', 'facebook']);

app.controller('FireBaseCtrl', function($scope, $route, $routeParams, $location, $firebaseObject, Facebook) {

	$scope.params = $routeParams;

	$scope.roomId = $routeParams.roomId;

	$scope.root = $firebaseObject(ref);

	$scope.allChatsMessages = {
		anime: [],
		any: [],
		developers: [],
		sports: [],
		technology: [],
		tvseries: []
	};

	var updateChat = function(snapshot) {		
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
			$scope.go('/room');
		}
	};

	$scope.logout = function() {
		myName = null;
		$scope.go('/');
	};

	$scope.enterSend = function(event) {
		if(event.keyCode == KEY_ENTER) {
			$scope.send();
		}
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


	/******* Facebook login functions **********************/

	$scope.logged = false;
	$scope.user = {};

	$scope.$watch(function(){
		return Facebook.isReady();
	}, function(newVal){
		if(newVal) {
			$scope.facebookReady = true;
		}
	});

	var userIsConnected = false;

	Facebook.getLoginStatus(function(response){
		if(response.status == 'connected') {
			userIsConnected = true;
		}
	});

	$scope.loginFB = function() {
		if(!userIsConnected) {
			$scope.loginF();
		}
	};

	$scope.loginF = function() {
		Facebook.login(function(response){
			if(response.status == 'connected') {
				$scope.logged = true;
				$scope.me();
			}
		});
	};

	$scope.me = function() {
		Facebook.api('/me', function(response){
			$scope.$apply(function(){
				$scope.user = response;
			});
		});
	};

	$scope.logoutFB = function() {
		Facebook.logout(function(){
			$scope.$apply(function(){
				$scope.user = {};
				$scope.logged = false;
			});
		});
	};

	$scope.$on('Facebook:statusChange', function(ev, data){
		console.log('Status', data);

		if(data.status == 'connected') {
			$scope.$apply(function(){
				//
			});
		}
	});

});

app.config(['FacebookProvider', function(FacebookProvider) {
	var appId = "423840851054944";//"115542472210842";
	FacebookProvider.init(appId);
}]);

app.config(function($routeProvider, $locationProvider) {
	var execute = function() {
		jQuery('#container-view').removeClass('full-height');
	};
	//------------ Home -----------------------------
	$routeProvider.when('/', {
		templateUrl: 'templates/login.html',
		controller: 'FireBaseCtrl',
		resolve: {
			delay: execute
		}
	});

	//------------ Chat rooms -----------------------------
	$routeProvider.when('/room', {
		templateUrl: 'templates/chat_rooms.html',
		controller: 'FireBaseCtrl',
		resolve: {
			delay: execute
		}
	});

	//------------ Chat -----------------------------
	$routeProvider.when('/room/:roomId', {
		templateUrl: 'templates/room.html',
		controller: 'FireBaseCtrl',
		resolve: {
			delay: function($q, $timeout) {
				jQuery('#container-view').addClass('full-height');
			}
		}
	});

});





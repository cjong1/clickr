// Create clickr Module
var clickrModule = angular.module("clickrApp", ['ngRoute']);

// Use the config method to set up routing for partials
clickrModule.config(function ($routeProvider){
	$routeProvider
		.when("/", {
			templateUrl: "partials/index.html"
		})
		.when("/login", {
			templateUrl: "partials/login.html"
		})
		.when("/join", {
			templateUrl: "partials/register.html"
		})
		.when("/create", {
			templateUrl: "partials/create.html"
		})
		.when("/home", {
			templateUrl: "partials/dashboard.html"
		})
		.when("/quiz/:id", {
			templateUrl: "partials/quiz.html"
		})
		.otherwise({
			redirectTo: "/"
		});
});

////// Users Controller
clickrModule.controller("UsersController", function($scope, $window, $rootScope, UsersFactory){
	$scope.master = {};
	console.log($rootScope.user);

	// Reset registration form
	$scope.reset = function(form) {
		if (form) {
			form.$setPristine();
			form.$setUntouched();
		}
		$scope.new_user = angular.copy($scope.master);
	};

	// Add user to db
	$scope.join = function(new_user){
		$scope.master = angular.copy(new_user);

		console.log($scope.master);
		UsersFactory.addUser($scope.new_user, function(info){
			if( info === "Error: A user with this email exists." || info === "Error: Passwords do not match."){
				$scope.successmsg = "";
				$scope.errormsg = info;
			}
			else{
				$scope.errormsg = "";
				$scope.successmsg = "You have successfully registered! Please log in.";
			}
		});
	};

	$scope.reset();

	$scope.login = function(user){
		UsersFactory.logIn(user, function(info){
			if( info === "Error: There is no user with this email address." || info === "Error: Incorrect password."){
				$scope.successmsg = "";
				$scope.errormsg = info;
			}
			else{
				$scope.errormsg = "";
				$scope.successmsg = "";
				console.log("login user email: ", user.email);
				console.log("localStorageService: ", localStorageService.get("user"));
				localStorageService.set("user", user.email);
				
				// Redirect to dashboard
				$window.location.href = "/dashboard.html";
			}
		})
	}
});

////// Users Factory
clickrModule.factory("UsersFactory", function($http){
	var factory = {};

	// make AJAX request to /order to add order to db
	factory.addUser = function(info, callback){
		$http.post("/add", info).success(function(output){
			// This callback with either show a message on the /reg page 
			callback(output);
		})
	};

	factory.logIn = function(info, callback){
		$http.post("/login", info).success(function(output){
			callback(output);
		})
	}
	// Return the factory so that everything inside of it is available to the CustomerController
	return factory;
});

////// Quizzes Controller
clickrModule.controller("quizzesController", function ($scope, quizFactory){

	// add a quiz from the Create Quiz page
	$scope.addQuiz = function(){
		console.log($scope.newQuiz);
		quizFactory.addQuiz($scope.newQuiz, function(){
			$scope.newQuiz = {};
			quizFactory.getQuizzes(function(data){
				$scope.quizzes = data;
			});
		})
	}

})

////// Quizzes Factory
clickrModule.factory("quizFactory", function($http) {

	var factory = {};

	factory.getQuizzes = function (callback){
		$http.get('/quizzes').success(function(output){
			callback(output);
		})
	};

	factory.addQuiz = function(info, callback) {
		$http.post("add_quiz", info).success(function(output){
			callback(output);
		});
	}

	factory.removeQuiz = function(info, callback) {
		$http.post('/remove_quiz', info).success(function(output){
			callback(output);
		})
	}

	factory.getOneQuiz = function(data, callback){
		// console.log(data);
		$http.post('/single_quiz/'+ data).success(function(data){
			callback(data);
		})
	}

	return factory;

})

////// Dashboard Controller
clickrModule.controller("dashboardController", function($scope, quizFactory, $routeParams){

	quizFactory.getQuizzes(function(data){
		$scope.quizzes = data;
	})

	// remove a quiz from the db
	$scope.removeQuiz = function(quiz){
		quizFactory.removeQuiz(quiz, function() {
			quizFactory.getQuizzes(function(data){
				$scope.quizzes = data;
			})
		})
	}

	$scope.quiz = '';
	$scope.quiz_id = $routeParams.id;
	
	quizFactory.getOneQuiz($routeParams.id, function(data){
		$scope.quiz = data;
		console.log(data);
	})

})
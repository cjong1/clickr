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
		.when("/edit/:id", {
			templateUrl: "partials/edit.html"
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

////// Quizzes Factory
clickrModule.factory("quizFactory", function($http) {

	var factory = {};

	// get all quizzes from database
	factory.getQuizzes = function (callback){
		$http.get('/quizzes').success(function(output){
			callback(output);
		})
	};

	// add a quiz into the database
	factory.addQuiz = function(info, callback) {
		$http.post("add_quiz", info).success(function(output){
			callback(output);
		});
	}

	// remove a quiz from the database
	factory.removeQuiz = function(info, callback) {
		$http.post('/remove_quiz', info).success(function(output){
			callback(output);
		})
	}

	// get one quiz from the database with specific ID
	factory.getOneQuiz = function(data, callback){
		$http.post("/get_quiz/"+ data).success(function(data){
			callback(data);
		})
	}

	// update a quiz in the database with specific ID
	factory.updateQuiz = function(data, info, callback) {
		$http.post("/update_quiz/"+ data, info).success(function(output){
			callback(output);
		});
	}

	return factory;

})

////// Dashboard Controller
clickrModule.controller("dashboardController", function($scope, quizFactory, $routeParams){

	// call on factory to get all quizzes to be displayed on dashboard page
	quizFactory.getQuizzes(function(data){
		$scope.quizzes = data;
	})

	// call on factory to remove a quiz from the database
	$scope.removeQuiz = function(quiz){
		quizFactory.removeQuiz(quiz, function() {
			quizFactory.getQuizzes(function(data){
				$scope.quizzes = data;
			})
		})
	}

	// add a quiz from the Create Quiz page
	$scope.addQuiz = function(){
		createQuizCode();
		$scope.newQuiz["quizCode"] = quizCode;
		quizFactory.addQuiz($scope.newQuiz, function(){
			$scope.newQuiz = {};
			quizFactory.getQuizzes(function(data){
				$scope.quizzes = data;
			});
		})
	}

	// create a 5-character code every time a quiz is created
	var quizCode = "";

	function createQuizCode()
	{
	    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	    for( var i=0; i < 5; i++ )
	        quizCode += possible.charAt(Math.floor(Math.random() * possible.length));

	    return quizCode;
	}

})

////// Quizzes Controller
clickrModule.controller("quizController", function($scope, quizFactory, $routeParams){
	// call on factory to grab quiz with specific ID
	quizFactory.getOneQuiz($routeParams.id, function(data){
		$scope.quiz = data;
	});

	// call on factory to update quiz with specific ID
	$scope.updateQuiz = function(){
		quizFactory.updateQuiz($routeParams.id, $scope.updatedQuiz, function(){
			$scope.updatedQuiz = {};
		})
	}
})
const app = angular.module('squirrelHub', []);

app.controller('SquirrelHubController', ['$scope', '$http', function SquirrelHubController($scope, $http) {
	$scope.pictures = [];

	$scope.loadPictures = function () {
		var response = $http.get('/rest/get/pictures').then(function (response) {
			$scope.pictures = response.data;
		});
	};

	$scope.incFavorites = function (index) {
		++$scope.pictures[index].favorites;
		var response = $http.get('/rest/set/picture/' + $scope.pictures[index]._id + '/favorites/' + $scope.pictures[index].favorites);
	};

	$scope.loadPictures();
}]);

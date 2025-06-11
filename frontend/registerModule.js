var app = angular.module('registerApp', []);

app.controller('registerCtrl', function($scope, $http) {
    $scope.runmsg = "Server is Running";

    $scope.newUser = {};
    $scope.users = [];

    $scope.registerUser = function() {
        if ($scope.newUser.fullname && $scope.newUser.email && $scope.newUser.password) {
            if ($scope.newUser.password === $scope.confirmPassword) {
                $http.post('http://localhost:3000/api/send-verification', $scope.newUser)
                .then(function(response) {
                    alert("Verification email sent! Check your inbox or spam.");
                    $scope.newUser = {};
                    $scope.confirmPassword = '';
                })
                .catch(function(error) {
                    alert(error.data.message || "Something went wrong!");
                });
            }
        }
    };
});


// loginModule.js
var app = angular.module('loginApp', []);

app.controller('loginCtrl', function($scope, $http) {
    $scope.loginData = {};

    $scope.loginUser = function() {
        if ($scope.loginData.email && $scope.loginData.password) {
            $http.post('http://localhost:3000/api/login', $scope.loginData)
            .then(function(response) {
                 // ✅ Save userId to localStorage
                 localStorage.setItem('userId', response.data.userId);
                // Redirect to home.html after successful login
                window.location.href = "home.html";
            })
            .catch(function(error) {
                alert(error.data.message || 'Login failed');
            });
        }
    };
});

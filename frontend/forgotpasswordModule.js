// frontend/forgotpasswordModule.js
var app = angular.module('forgotApp', []);

app.controller('forgotCtrl', function($scope, $http) {
  $scope.email = '';

  $scope.sendResetLink = function() {
    if (!$scope.email) {
      alert("Please enter your email.");
      return;
    }

    $http.post('http://localhost:3000/api/password-reset', { email: $scope.email })
      .then(function(response) {
        alert(response.data.message);
        window.location.href = "login.html";
      })
      .catch(function(error) {
        alert(error.data.message || 'Something went wrong');
      });
  };
});

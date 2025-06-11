var app = angular.module('registerApp', []);

app.controller('registerCtrl', function($scope, $http, $location) {
  // Get token from URL query parameters
  $scope.token = new URLSearchParams(window.location.search).get('token');
  
  if (!$scope.token) {
    alert("Invalid password reset link. Please request a new one.");
    window.location.href = "/login.html";
    return;
  }
  
  $scope.newUser = {
    password: ''
  };
  
  $scope.resetPassword = function() {
    // Check if passwords match
    if ($scope.newUser.password !== $scope.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    
    // Send password reset request
    $http.post('http://localhost:3000/api/reset-password', {
      token: $scope.token,
      newPassword: $scope.newUser.password
    })
    .then(function(response) {
      alert(response.data.message);
      window.location.href = "/login.html";
    })
    .catch(function(error) {
      alert(error.data.message || "Failed to reset password. Please try again.");
    });
  };
});
var app = angular.module('profileApp', []);

app.controller('profileCtrl', function($scope, $http) {
  const userId = localStorage.getItem('userId');

  // Fetch profile info
  $http.get(`http://localhost:3000/api/user/${userId}`)
    .then(function(response) {
      $scope.user = response.data;
    });

  // Update profile image
  $scope.uploadImage = function(input) {
    const file = input.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const base64 = e.target.result;
        $http.put(`http://localhost:3000/api/user/image/${userId}`, { profileImage: base64 })
          .then(function(res) {
            alert(res.data.message);
            $scope.user.profileImage = base64;
            $scope.$apply(); // trigger update
          });
      };
      reader.readAsDataURL(file);
    }
  };

  // Send email for password reset
  $scope.sendPasswordReset = function() {
    $http.post('http://localhost:3000/api/password-reset', { email: $scope.user.email })
      .then(function(res) {
        alert(res.data.message);
      }).catch(function(err) {
        alert(err.data.message || 'Failed to send reset link');
      });
  };
});

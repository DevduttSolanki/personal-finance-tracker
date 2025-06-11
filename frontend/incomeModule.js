var app = angular.module('incomeApp', []);

app.controller('incomeCtrl', function($scope, $http) {
  $scope.income = {};
  $scope.incomes = [];
  $scope.editMode = false;

  const userId = localStorage.getItem('userId');

  // Load all incomes on page load
  function loadIncome() {
    $http.get(`http://localhost:3000/api/income?userId=${userId}`)
    .then(res => { $scope.incomes = res.data; }); // ✅ Correct scope variable
  }

  $scope.addOrUpdateIncome = function() {
    $scope.income.userId = userId;
    if ($scope.editMode) {
      $http.put(`http://localhost:3000/api/income/${$scope.income._id}`, $scope.income)
      .then(function() {
        loadIncome();
        $scope.reset();
      });
    } else {
      $http.post('http://localhost:3000/api/income', $scope.income)
      .then(function() {
        loadIncome();
        $scope.reset();
      });
    }
  };

  $scope.editIncome = function(item) {
    $scope.income = angular.copy(item);
    $scope.editMode = true;
  };

  $scope.deleteIncome = function(id) {
    $http.delete(`http://localhost:3000/api/income/${id}`)
    .then(function() {
      loadIncome();
    });
  };

  $scope.reset = function() {
    $scope.income = {};
    $scope.editMode = false;
  };

  loadIncome(); // initial load
});

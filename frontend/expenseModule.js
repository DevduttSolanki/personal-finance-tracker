// expenseModule.js
var app = angular.module('expenseApp', []);

app.controller('expenseCtrl', function($scope, $http) {
  $scope.expense = {};
  $scope.expenses = [];
  $scope.editMode = false;

  const userId = localStorage.getItem('userId');

  // Load all expense
  function loadExpenses() {
    $http.get(`http://localhost:3000/api/expense?userId=${userId}`)
      .then(res => { $scope.expenses = res.data; });
  }

  // Add or Update
  $scope.addOrUpdateExpense = function() {
    $scope.expense.userId = userId;
    if ($scope.editMode) {
      $http.put(`http://localhost:3000/api/expense/${$scope.expense._id}`, $scope.expense)
      .then(function() {
        loadExpenses();
        $scope.reset();
      });
    } else {
      $http.post('http://localhost:3000/api/expense', $scope.expense)
      .then(function() {
        loadExpenses();
        $scope.reset();
      });
    }
  };

  $scope.editExpense = function(item) {
    $scope.expense = angular.copy(item);
    $scope.editMode = true;
  };

  $scope.deleteExpense = function(id) {
    $http.delete(`http://localhost:3000/api/expense/${id}`)
    .then(function() {
      loadExpenses();
    });
  };

  $scope.reset = function() {
    $scope.expense = {};
    $scope.editMode = false;
  };

  loadExpenses(); // Initial fetch
});

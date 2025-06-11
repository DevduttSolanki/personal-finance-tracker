// budgetModule.js
var app = angular.module('budgetApp', []);

app.controller('budgetCtrl', function($scope, $http) {
  $scope.monthlyBudget = null;
  $scope.totalExpenses = 0;

  const userId = localStorage.getItem('userId');

  // Save budget to backend
  $scope.saveBudget = function() {
    $http.post('http://localhost:3000/api/budget', { userId: userId, amount: $scope.monthlyBudget })
      .then(function(response) {
        alert('Budget saved successfully!');
      });
  };

  // Get saved budget
  function getBudget() {
    $http.get(`http://localhost:3000/api/budget?userId=${userId}`)
      .then(function(response) {
        if (response.data && response.data.amount) {
          $scope.monthlyBudget = response.data.amount;
        }
      });
  }

  // Get total expenses
 // This will get actual expense data and calculate total
function getTotalExpenses() {
  $http.get(`http://localhost:3000/api/expense?userId=${userId}`)
    .then(function(response) {
      $scope.totalExpenses = response.data.reduce((total, e) => total + e.amount, 0);
    });
}


  // Initial fetch
  getBudget();
  getTotalExpenses();
});

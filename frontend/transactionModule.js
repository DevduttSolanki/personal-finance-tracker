var app = angular.module('transactionApp', []);

app.controller('transactionCtrl', function($scope, $http) {
  $scope.transactions = [];
  $scope.filteredTransactions = [];
  $scope.filters = {};

  const userId = localStorage.getItem('userId');

  // Load income and expenses
  function loadTransactions() {
    $http.get(`http://localhost:3000/api/income?userId=${userId}`).then(function(res1) {
      const income = res1.data.map(item => ({ ...item, type: 'Income' }));

      $http.get(`http://localhost:3000/api/expense?userId=${userId}`).then(function(res2) {
        const expenses = res2.data.map(item => ({ ...item, type: 'Expense' }));

        $scope.transactions = [...income, ...expenses];
        $scope.filteredTransactions = angular.copy($scope.transactions);
      });
    });
  }

  // Filter transactions
  $scope.applyFilters = function() {
    $scope.filteredTransactions = $scope.transactions.filter(t => {
      const tDate = new Date(t.createdAt);
      const sDate = $scope.filters.startDate ? new Date($scope.filters.startDate) : null;
      const eDate = $scope.filters.endDate ? new Date($scope.filters.endDate) : null;

      return (!sDate || tDate >= sDate)
        && (!eDate || tDate <= eDate)
        && (!$scope.filters.category || (t.category || t.source).toLowerCase().includes($scope.filters.category.toLowerCase()))
        && (!$scope.filters.minAmount || t.amount >= $scope.filters.minAmount)
        && (!$scope.filters.maxAmount || t.amount <= $scope.filters.maxAmount);
    });
  };

  // Reset filters
  $scope.resetFilters = function() {
    $scope.filters = {};
    $scope.filteredTransactions = angular.copy($scope.transactions);
  };

  loadTransactions(); // on load
});

var app = angular.module('chartApp', []);

app.controller('chartCtrl', function($scope, $http) {
  const userId = localStorage.getItem('userId');

  // Fetch and process data
  function loadData() {
    $http.get(`http://localhost:3000/api/expense?userId=${userId}`).then(expRes => {
      const expenses = expRes.data;

      // PIE CHART - Group by category
      const categoryMap = {};
      expenses.forEach(e => {
        categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
      });

      const pieLabels = Object.keys(categoryMap);
      const pieData = Object.values(categoryMap);

      const pieCtx = document.getElementById('expensePieChart').getContext('2d');
      new Chart(pieCtx, {
        type: 'pie',
        data: {
          labels: pieLabels,
          datasets: [{
            data: pieData,
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
          }]
        }
      });

      // BAR CHART - Income vs Expense by month
      $http.get(`http://localhost:3000/api/income?userId=${userId}`).then(incRes => {
        const income = incRes.data;

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const incomeByMonth = new Array(12).fill(0);
        const expenseByMonth = new Array(12).fill(0);

        income.forEach(i => {
          const m = new Date(i.createdAt).getMonth();
          incomeByMonth[m] += i.amount;
        });

        expenses.forEach(e => {
          const m = new Date(e.createdAt).getMonth();
          expenseByMonth[m] += e.amount;
        });

        const barCtx = document.getElementById('incomeBarChart').getContext('2d');
        new Chart(barCtx, {
          type: 'bar',
          data: {
            labels: months,
            datasets: [
              {
                label: 'Income',
                data: incomeByMonth,
                backgroundColor: '#36A2EB'
              },
              {
                label: 'Expense',
                data: expenseByMonth,
                backgroundColor: '#FF6384'
              }
            ]
          },
          options: {
            responsive: true,
            scales: {
              y: { beginAtZero: true }
            }
          }
        });
      });
    });
  }

  loadData();
});

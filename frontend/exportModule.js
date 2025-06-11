var app = angular.module('exportApp', []);

app.controller('exportCtrl', function($scope, $http) {
  const userId = localStorage.getItem('userId');
  $scope.allData = [];

  // Fetch Income + Expense
  function fetchData() {
    $http.get(`http://localhost:3000/api/income?userId=${userId}`).then(incomeRes => {
      const incomeData = incomeRes.data.map(i => ({
        Type: 'Income',
        SourceOrCategory: i.source,
        Amount: i.amount,
        Date: new Date(i.createdAt).toLocaleString()
      }));

      $http.get(`http://localhost:3000/api/expense?userId=${userId}`).then(expenseRes => {
        const expenseData = expenseRes.data.map(e => ({
          Type: 'Expense',
          SourceOrCategory: e.category,
          Amount: e.amount,
          Date: new Date(e.createdAt).toLocaleString()
        }));

        $scope.allData = [...incomeData, ...expenseData];
      });
    });
  }

  fetchData();

  // Export as Excel
  $scope.exportToExcel = function() {
    const worksheet = XLSX.utils.json_to_sheet($scope.allData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    XLSX.writeFile(workbook, "PersonalFinanceData.xlsx");
  };

  // Export as PDF
  $scope.exportToPDF = async function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text("Personal Finance Data", 10, 10);

    let y = 20;
    $scope.allData.forEach((item, index) => {
      const line = `${index + 1}. ${item.Type} | ${item.SourceOrCategory} | ₹${item.Amount} | ${item.Date}`;
      doc.text(line, 10, y);
      y += 10;
    });

    doc.save("PersonalFinanceData.pdf");
  };
});

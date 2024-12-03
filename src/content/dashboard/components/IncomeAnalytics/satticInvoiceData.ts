export type InvoiceData = {
  day: {
    income: number[];
    expense: number[];
    netIncome: number[];
    totalIncome: number;
    totalExpense: number;
    netIncomePercentage: number;
    totalInvoices: number;
  };
  month: {
    income: number[];
    expense: number[];
    netIncome: number[];
    totalIncome: number;
    totalExpense: number;
    netIncomePercentage: number;
    totalInvoices: number;
  };
  year: {
    income: number[];
    expense: number[];
    netIncome: number[];
    totalIncome: number;
    totalExpense: number;
    netIncomePercentage: number;
    totalInvoices: number;
  };
};

export const staticInvoiceData: InvoiceData = {
  day: {
    income: [200, 300, 250, 400, 350, 500, 450],
    expense: [150, 200, 180, 220, 200, 300, 250],
    netIncome: [50, 100, 70, 180, 150, 200, 200],
    totalIncome: 2250, // Example total
    totalExpense: 1480, // Example total
    netIncomePercentage: 15, // Example percentage
    totalInvoices: 120 // Example total
  },
  month: {
    income: [
      5000, 6000, 5500, 7000, 6500, 8000, 7500, 8200, 9000, 8500, 9300, 10000
    ],
    expense: [
      3000, 3500, 3200, 4000, 3800, 4500, 4200, 4800, 5000, 4700, 5200, 5500
    ],
    netIncome: [
      2000, 2500, 2300, 3000, 2700, 3500, 3300, 3400, 4000, 3800, 4100, 4500
    ],
    totalIncome: 90000, // Example total
    totalExpense: 50000, // Example total
    netIncomePercentage: 40, // Example percentage
    totalInvoices: 1000 // Example total
  },
  year: {
    income: [60000, 65000, 70000, 75000],
    expense: [35000, 40000, 42000, 45000],
    netIncome: [25000, 25000, 28000, 30000],
    totalIncome: 270000, // Example total
    totalExpense: 162000, // Example total
    netIncomePercentage: 60, // Example percentage
    totalInvoices: 12000 // Example total
  }
};

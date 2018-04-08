import * as ynab from 'ynab';
export interface YnabSampleData {
  Budgets: ynab.BudgetSummary[];
  Accounts: ynab.Account[];
  Months: ynab.MonthSummary[];
}

import * as ynab from 'ynab';
export interface YnabSampleData {
  Budget: ynab.BudgetDetail;
  Budgets: ynab.BudgetSummary[];
  Accounts: ynab.Account[];
  Months: ynab.MonthSummary[];
  Month: ynab.MonthDetail;
  CategoryGroupsWithCategories: ynab.CategoryGroupWithCategories[];
}

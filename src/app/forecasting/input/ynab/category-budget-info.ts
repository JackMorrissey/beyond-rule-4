import * as ynab from 'ynab';

export class CategoryBudgetInfo {
  category: ynab.Category;
  monthBalances: {} = {};
  average = 0;
  max = 0;
  min: number;
  categoryNote: string;

  constructor(category: ynab.Category, monthDetails: ynab.MonthDetail[]) {
    this.category = category;
    this.addMonths(monthDetails);
  }

  private addMonths(monthDetails: ynab.MonthDetail[]) {
    monthDetails.forEach(m => this.addMonth(m));
    this.compute();
  }

  private addMonth(monthDetail: ynab.MonthDetail) {
    const found = monthDetail.categories.find(c => this.category.id === c.id);
    if (!found) {
      return;
    }
    this.categoryNote = found.note;
    const retrievedBudgeted = !found ? 0 : found.budgeted;
    this.monthBalances[monthDetail.month] = retrievedBudgeted;
  }

  private compute() {
    let monthCount = 0;
    let sum = 0;
    for (const month in this.monthBalances) {
      if (this.monthBalances.hasOwnProperty(month)) {
        const budgeted = this.monthBalances[month];
        monthCount++;
        sum += budgeted;
        if (budgeted > this.max) {
          this.max = ynab.utils.convertMilliUnitsToCurrencyAmount(budgeted);
        }
        if (this.min === undefined || budgeted < this.min) {
          this.min = ynab.utils.convertMilliUnitsToCurrencyAmount(budgeted);
        }
      }
    }
    if (monthCount === 0) {
      return;
    }
    this.average = ynab.utils.convertMilliUnitsToCurrencyAmount(sum / monthCount);
  }
}

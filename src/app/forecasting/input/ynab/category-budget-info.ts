import * as ynab from 'ynab';

export class CategoryBudgetInfo {
  category: ynab.Category;
  monthBalances: {} = {};
  mean = 0;
  max = { month: '', value: undefined};
  min = { month: '', value: undefined};
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
        if (!budgeted && budgeted !== 0) {
          continue;
        }
        monthCount++;
        sum += budgeted;
        if (this.max.value === undefined || budgeted > this.max.value) {
          this.max = {
            month: month,
            value: budgeted
          };
        }
        if (this.min.value === undefined || budgeted < this.min.value) {
          this.min = {
            month: month,
            value: budgeted
          };
        }
      }
    }
    if (monthCount === 0) {
      return;
    }
    this.min.value = this.min.value ? ynab.utils.convertMilliUnitsToCurrencyAmount(this.min.value) : 0;
    this.max.value = this.max.value ? ynab.utils.convertMilliUnitsToCurrencyAmount(this.max.value) : 0;
    this.mean = ynab.utils.convertMilliUnitsToCurrencyAmount(sum / monthCount);
  }
}

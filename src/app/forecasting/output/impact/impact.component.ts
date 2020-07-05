import { Component, OnInit, Input, OnChanges, SimpleChanges, } from '@angular/core';
import { Forecast } from '../../models/forecast.model';
import { CalculateInput } from '../../models/calculate-input.model';

@Component({
    selector: 'app-expense-impact',
    templateUrl: 'impact.component.html'
})

export class ImpactComponent implements OnInit, OnChanges {

    @Input() calculateInput: CalculateInput;
    @Input() forecast: Forecast;

    spendingCategoriesWithImpact;

    ngOnInit() {
        this.calculateData();
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.calculateData();
    }

    calculateData() {
        if (!this.calculateInput.budgetCategoryGroups) {
            return;
        }

        const currentFiForecast = this.getFiForecast(this.forecast, this.calculateInput.fiNumber);

        if (!currentFiForecast) {
            return;
        }

        const categories = [].concat(...this.calculateInput.budgetCategoryGroups.map((group) => {
            return group.categories;
        }));
        const categoriesWithSpending = categories.filter((category) => {
            return category.fiBudget > 0;
        }).sort((a, b) => {
            return b.fiBudget - a.fiBudget;
        });

        this.spendingCategoriesWithImpact = categoriesWithSpending.map((category) => {
            const isFi = !this.forecast.getDistanceFromFirstMonthText(currentFiForecast.date);

            let impactDate = 'Achieved FI!';
            if (isFi) {

                return {
                    category,
                    impactDate,
                    isFi
                };
            }

            const modifiedCalcInput = this.getModifiedCalculateInput(category.fiBudget);
            const modifiedForecast = new Forecast(modifiedCalcInput);
            const modifiedFiForecast = this.getFiForecast(modifiedForecast, modifiedCalcInput.fiNumber);

            impactDate = this.getImpactDateText(currentFiForecast.date, modifiedFiForecast.date);

            return {
                category,
                impactDate,
                isFi
            };
        });
    }

    private getModifiedCalculateInput(fiSpendingReductionPerMonth: number): CalculateInput {
        const calcInput = new CalculateInput();
        calcInput.annualExpenses = this.calculateInput.annualExpenses - fiSpendingReductionPerMonth * 12;
        calcInput.annualSafeWithdrawalRate = this.calculateInput.annualSafeWithdrawalRate;
        calcInput.expectedAnnualGrowthRate = this.calculateInput.expectedAnnualGrowthRate;
        calcInput.netWorth = this.calculateInput.netWorth;
        calcInput.monthlyContribution = this.calculateInput.monthlyContribution + fiSpendingReductionPerMonth;
        return calcInput;
    }

    private getFiForecast(forecast: Forecast, fiNumber: number) {
        return forecast.monthlyForecasts.find(f => f.netWorth >= fiNumber);
    }

    private getImpactDateText(currentDate: Date, newDate: Date): string {
        let monthDifference =
            ((currentDate.getFullYear() - newDate.getFullYear()) * 12)
            + (currentDate.getMonth() - newDate.getMonth());

        if (monthDifference === 0) {
            return '<1 month';
        }

        monthDifference = Math.abs(monthDifference);

        const months = monthDifference % 12;
        const years = (monthDifference - months) / 12;
        const difference = this.getTimeString(years, 'year') + this.getTimeString(months, 'month');
        return difference;
    }

    private getTimeString(timeDifference: number, unit: string): string {
        if (timeDifference === 0) {
            return '';
        }
        if (timeDifference === 1) {
            return `1 ${unit} `;
        }
        return `${timeDifference} ${unit}s `;
    }
}

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

        const categories = [].concat(...this.calculateInput.budgetCategoryGroups.map((group) => {
            return group.categories;
        }));
        const categoriesWithSpending = categories.filter((category) => {
            return category.fiBudget > 0;
        }).sort((a, b) => {
            return b.fiBudget - a.fiBudget;
        });

        this.spendingCategoriesWithImpact = categoriesWithSpending.map((category) => {
            const modifiedCalcInput = this.getModifiedCalculateInput(category.fiBudget);
            const modifiedForecast = new Forecast(modifiedCalcInput);
            const modifiedFiForecast = this.getFiForecast(modifiedForecast, modifiedCalcInput.fiNumber);

            const impactDate = this.getImpactDateText(currentFiForecast.date, modifiedFiForecast.date);

            return {
                category,
                impactDate
            };
        });
    }

    private getModifiedCalculateInput(spendingReductionPerMonth: number): CalculateInput {
        const calcInput = new CalculateInput();
        calcInput.annualExpenses = this.calculateInput.annualExpenses - spendingReductionPerMonth * 12;
        calcInput.annualSafeWithdrawalRate = this.calculateInput.annualSafeWithdrawalRate;
        calcInput.expectedAnnualGrowthRate = this.calculateInput.expectedAnnualGrowthRate;
        calcInput.netWorth = this.calculateInput.netWorth;
        calcInput.monthlyContribution = this.calculateInput.monthlyContribution + spendingReductionPerMonth;
        return calcInput;
    }

    private getFiForecast(forecast: Forecast, fiNumber: number) {
        return forecast.monthlyForecasts.find(f => f.netWorth >= fiNumber);
    }

    private getImpactDateText(currentDate: Date, newDate: Date): string {
        if (newDate > currentDate) {
            return "<1 day";
        }

        var diffDate = new Date(currentDate.getTime() - newDate.getTime())

        var years = "";
        if (diffDate.getUTCFullYear() - 1970 > 0) {
            years = diffDate.getUTCFullYear() - 1970 + " years ";
        }

        var months = "";
        if (diffDate.getUTCMonth() > 0) {
            months = diffDate.getUTCMonth() + " months ";
        }
        var days = "";
        if (!years && !months) {
            days = diffDate.getUTCDay() + " days ";
        }

        return years + months + days;
    }
}
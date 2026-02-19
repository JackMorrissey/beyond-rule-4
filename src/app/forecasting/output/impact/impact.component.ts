import { Component, OnInit, Input, OnChanges, SimpleChanges, } from '@angular/core';
import { Forecast } from '../../models/forecast.model';
import { CalculateInput } from '../../models/calculate-input.model';
import { birthdateToDate } from '../../input/ynab/birthdate-utility';

@Component({
    selector: 'app-expense-impact',
    templateUrl: 'impact.component.html',
    standalone: false
})

export class ImpactComponent implements OnInit, OnChanges {

    @Input() calculateInput: CalculateInput;
    @Input() forecast: Forecast;

    spendingCategoriesWithImpact;
    activeMode: 'fi' | 'leanFi' | 'coastFi' = 'fi';

    get hasCoastFi(): boolean {
    return birthdateToDate(this.calculateInput?.birthdate) !== null && 
           this.calculateInput?.targetRetirementAge !== null;
    }

    setMode(mode: 'fi' | 'leanFi' | 'coastFi') {
        this.activeMode = mode;
        if (this.spendingCategoriesWithImpact) {
            this.spendingCategoriesWithImpact.sort((a, b) => {
                const aValue = mode === 'leanFi' ? a.category.leanFiBudget : a.category.fiBudget;
                const bValue = mode === 'leanFi' ? b.category.leanFiBudget : b.category.fiBudget;
                return bValue - aValue;
            });
        }
    }

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
        const currentLeanFiForecast = this.getFiForecast(this.forecast, this.calculateInput.leanFiNumber);
        const currentCoastFiForecast = this.getCoastFiForecast(this.forecast, this.calculateInput);

        if (!currentFiForecast) {
            return;
        }

        const categories = [].concat(...this.calculateInput.budgetCategoryGroups.map((group) => {
            return group.categories;
        }));
        const categoriesWithSpending = categories.filter((category) => {
            return category.fiBudget > 0 || category.leanFiBudget > 0;
        }).sort((a, b) => {
            return b.fiBudget - a.fiBudget;
        });

        this.spendingCategoriesWithImpact = categoriesWithSpending.map((category) => {
            const isFi = currentFiForecast.date < new Date();
            const isLeanFi = currentLeanFiForecast && currentLeanFiForecast.date < new Date();
            const isCoastFi = currentCoastFiForecast && currentCoastFiForecast.date < new Date();

            let impactDate = 'Achieved FI!';
            let leanImpactDate = null;
            let coastFiImpactDate = null;

            // Calculate Coast FI impact
            if (currentCoastFiForecast && category.fiBudget > 0) {
                if (isCoastFi) {
                    coastFiImpactDate = 'Achieved Coast FI!';
                } else {
                    const modifiedCoastCalcInput = this.getModifiedCalculateInputForCoastFi(category.fiBudget);
                    const modifiedCoastForecast = new Forecast(modifiedCoastCalcInput);
                    const modifiedCoastFiForecast = this.getCoastFiForecast(modifiedCoastForecast, modifiedCoastCalcInput);
                    if (modifiedCoastFiForecast) {
                        coastFiImpactDate = this.getImpactDateText(currentCoastFiForecast.date, modifiedCoastFiForecast.date);
                    }
                }
            }

            if (isFi) {
                return {
                    category,
                    impactDate,
                    isFi,
                    leanImpactDate: isLeanFi ? 'Achieved Lean FI!' : null,
                    isLeanFi,
                    coastFiImpactDate,
                    isCoastFi
                };
            }

            const modifiedCalcInput = this.getModifiedCalculateInput(category.fiBudget);
            const modifiedForecast = new Forecast(modifiedCalcInput);
            const modifiedFiForecast = this.getFiForecast(modifiedForecast, modifiedCalcInput.fiNumber);

            impactDate = this.getImpactDateText(currentFiForecast.date, modifiedFiForecast.date);

            // Calculate Lean FI impact
            if (category.leanFiBudget > 0 && currentLeanFiForecast) {
                if (isLeanFi) {
                    leanImpactDate = 'Achieved Lean FI!';
                } else {
                    const modifiedLeanCalcInput = this.getModifiedCalculateInputForLeanFi(category.leanFiBudget);
                    const modifiedLeanForecast = new Forecast(modifiedLeanCalcInput);
                    const modifiedLeanFiForecast = this.getFiForecast(modifiedLeanForecast, modifiedLeanCalcInput.leanFiNumber);
                    if (modifiedLeanFiForecast) {
                        leanImpactDate = this.getImpactDateText(currentLeanFiForecast.date, modifiedLeanFiForecast.date);
                    }
                }
            }

            return {
                category,
                impactDate,
                isFi,
                leanImpactDate,
                isLeanFi,
                coastFiImpactDate,
                isCoastFi
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

    private getModifiedCalculateInputForLeanFi(leanFiSpendingReductionPerMonth: number): CalculateInput {
        const calcInput = new CalculateInput();
        calcInput.annualExpenses = this.calculateInput.annualExpenses;
        calcInput.leanAnnualExpenses = this.calculateInput.leanAnnualExpenses - leanFiSpendingReductionPerMonth * 12;
        calcInput.annualSafeWithdrawalRate = this.calculateInput.annualSafeWithdrawalRate;
        calcInput.expectedAnnualGrowthRate = this.calculateInput.expectedAnnualGrowthRate;
        calcInput.netWorth = this.calculateInput.netWorth;
        calcInput.monthlyContribution = this.calculateInput.monthlyContribution + leanFiSpendingReductionPerMonth;
        return calcInput;
    }

    private getModifiedCalculateInputForCoastFi(fiSpendingReductionPerMonth: number): CalculateInput {
        const calcInput = new CalculateInput();
        calcInput.annualExpenses = this.calculateInput.annualExpenses - fiSpendingReductionPerMonth * 12;
        calcInput.annualSafeWithdrawalRate = this.calculateInput.annualSafeWithdrawalRate;
        calcInput.expectedAnnualGrowthRate = this.calculateInput.expectedAnnualGrowthRate;
        calcInput.netWorth = this.calculateInput.netWorth;
        calcInput.monthlyContribution = this.calculateInput.monthlyContribution + fiSpendingReductionPerMonth;
        calcInput.birthdate = this.calculateInput.birthdate;
        calcInput.targetRetirementAge = this.calculateInput.targetRetirementAge;
        return calcInput;
    }

    private getCoastFiForecast(forecast: Forecast, calcInput: CalculateInput) {
        return forecast.monthlyForecasts.find(f => {
            const coastFi = calcInput.getCoastFiNumberAt(f.date);
            return coastFi !== null && f.netWorth >= coastFi;
        });
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

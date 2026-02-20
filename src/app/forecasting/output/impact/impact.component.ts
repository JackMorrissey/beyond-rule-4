import { Component, OnInit, Input, OnChanges, SimpleChanges, } from '@angular/core';
import { Forecast } from '../../models/forecast.model';
import { CalculateInput } from '../../models/calculate-input.model';
import { birthdateToDate } from '../../input/ynab/birthdate-utility';
import { aggregateTimeSeries, TimeSeries } from '../../models/time-series.model';
import { ScheduledChangesState, SCHEDULED_CHANGES_STORAGE_KEY } from '../../models/scheduled-change.model';

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
    
    private scheduledChangesEnabled = true;
    private disabledChangeIds: Set<string> = new Set();

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
        const categoriesWithSpending = categories.filter(category => 
            category.fiBudget > 0 ||
            category.leanFiBudget > 0 ||
            (category.computedFiBudgetSchedule?.schedule || []).some(p => p.value > 0) ||
            (category.computedLeanFiBudgetSchedule?.schedule || []).some(p => p.value > 0)
        ).sort((a, b) => {
            return b.fiBudget - a.fiBudget;
        });

        // Load scheduled changes state from localStorage
        try {
            const storedState = JSON.parse(
                window.localStorage.getItem(SCHEDULED_CHANGES_STORAGE_KEY)
            ) as ScheduledChangesState;
            if (storedState) {
                this.scheduledChangesEnabled = storedState.globalEnabled;
                this.disabledChangeIds = new Set(storedState.disabledChangeIds || []);
            }
        } catch {
            // Ignore parse errors, use defaults
        }

        this.spendingCategoriesWithImpact = categoriesWithSpending.map((category) => {
            const isFi = currentFiForecast.date <= new Date();
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
                    const modifiedCoastCalcInput = this.getModifiedCalculateInput(category, 'fiBudget');
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

            const modifiedCalcInput = this.getModifiedCalculateInput(category, 'fiBudget');
            const modifiedForecast = new Forecast(modifiedCalcInput);
            const modifiedFiForecast = this.getFiForecast(modifiedForecast, modifiedCalcInput.fiNumber);

            impactDate = this.getImpactDateText(currentFiForecast.date, modifiedFiForecast.date);

            // Calculate Lean FI impact
            if (category.leanFiBudget > 0 && currentLeanFiForecast) {
                if (isLeanFi) {
                    leanImpactDate = 'Achieved Lean FI!';
                } else {
                    const modifiedLeanCalcInput = this.getModifiedCalculateInput(category, 'leanFiBudget');
                    const modifiedLeanForecast = new Forecast(modifiedLeanCalcInput, 'leanFiNumber');
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

    /**
     * Get a modified CalculateInput with a single category reduced in spending
     */
    private getModifiedCalculateInput(category: any, scheduleType: 'fiBudget' | 'leanFiBudget' = 'fiBudget'): CalculateInput {
        const calcInput = new CalculateInput();

        // Determine baseline and series for this category
        const series = this.getCategoryTimeSeries(category, scheduleType === 'fiBudget' ? 'computedFiBudgetSchedule' : 'computedLeanFiBudgetSchedule', category[scheduleType], scheduleType);

        // Subtract the expenses (series and annual total)
        if (scheduleType == 'fiBudget') {
            calcInput.annualExpensesSeries = this.calculateInput.annualExpensesSeries.subtract(series);
            calcInput.annualExpenses = calcInput.annualExpensesSeries.getBaselineValue() * 12;
        } else {
            calcInput.leanAnnualExpensesSeries = this.calculateInput.leanAnnualExpensesSeries.subtract(series);
            calcInput.leanAnnualExpenses = calcInput.leanAnnualExpensesSeries.getBaselineValue() * 12;
            // console.log(calcInput.leanAnnualExpensesSeries);
            // console.log(calcInput.leanAnnualExpenses);
        }
        
        // Apply savings to monthly contribution
        calcInput.monthlyContributionSeries = aggregateTimeSeries([this.calculateInput.monthlyContributionSeries, series]);
        calcInput.monthlyContribution = calcInput.monthlyContributionSeries.getBaselineValue() * 12;

        // Copy over other unchanged properties
        calcInput.annualSafeWithdrawalRate = this.calculateInput.annualSafeWithdrawalRate;
        calcInput.expectedAnnualGrowthRate = this.calculateInput.expectedAnnualGrowthRate;
        calcInput.netWorth = this.calculateInput.netWorth;
        calcInput.birthdate = this.calculateInput.birthdate;
        calcInput.targetRetirementAge = this.calculateInput.targetRetirementAge;

        return calcInput;
    }

    /**
     * Build a TimeSeries for a specific category from its schedule property
     */
    private getCategoryTimeSeries(category: any, scheduleProperty: string, baselineValue: number, scheduleType: string): TimeSeries {
        const series = new TimeSeries(baselineValue);
        const schedule = category[scheduleProperty];

        if (schedule?.schedule?.length > 0) {
            for (const point of schedule.schedule) {
                const changeId = `${category.name}-${scheduleType}-${point.effectiveDate}`;
                if (this.scheduledChangesEnabled && !this.disabledChangeIds.has(changeId)) {
                    series.addPoint(point.effectiveDate, point.value);
                }
            }
        }

        return series;
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

    isCategoryScheduled(category: any): boolean {
        // Check if the series exists and has points
        let schedule = this.activeMode == 'leanFi' ? 'computedLeanFiBudgetSchedule' : 'computedFiBudgetSchedule';
        let scheduleType = this.activeMode == 'leanFi' ? 'leanFiBudget' : 'fiBudget';
        const series = category[schedule]?.schedule || [];

        // Filter out points that are disabled in scheduled changes
        const activePoints = series.filter(point => {
            const changeId = `${category.name}-${scheduleType}-${point.effectiveDate}`;
            return this.scheduledChangesEnabled && !this.disabledChangeIds.has(changeId);
        });

        // If no active points, then budget is fixed
        return activePoints.length === 0;
    }
}

export interface ScheduledChange {
  id: string;                    // Unique ID: `${categoryId}-${type}-${date}`
  categoryName: string;
  categoryId: string;
  type: 'contribution' | 'fiBudget' | 'leanFiBudget';
  baselineValue: number;
  scheduledValue: number;
  effectiveDate: string;         // YYYY-MM
  enabled: boolean;
}

export interface ScheduledChangesState {
  globalEnabled: boolean;
  disabledChangeIds: string[];   // Store which changes are disabled (default is enabled)
}

export const SCHEDULED_CHANGES_STORAGE_KEY = 'br4-scheduled-changes-state';

export interface BaselineOverride {
  id: string;                    // Unique ID: `${categoryId}-${type}-baseline`
  categoryName: string;
  categoryId: string;
  source: 'category' | 'account';
  type: 'contribution' | 'fiBudget' | 'leanFiBudget' | 'startingPortfolio' | 'monthlyContribution';
  originalValue: number;         // YNAB value before override
  overriddenValue: number;       // Value after BR4 override
  enabled: boolean;
}

export interface BaselineOverridesState {
  globalEnabled: boolean;
  disabledOverrideIds: string[];
}

export const BASELINE_OVERRIDES_STORAGE_KEY = 'br4-baseline-overrides-state';

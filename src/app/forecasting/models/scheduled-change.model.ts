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

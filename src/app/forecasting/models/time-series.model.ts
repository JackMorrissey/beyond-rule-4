export interface TimePoint {
  effectiveDate: string | null; // "YYYY-MM" or null for baseline
  value: number;
}

export class TimeSeries {
  private points: TimePoint[] = [];

  constructor(baselineValue: number = 0) {
    this.points.push({ effectiveDate: null, value: baselineValue });
  }

  /**
   * Add a time point with a value that becomes effective on the given date.
   * Points are automatically sorted by date.
   */
  addPoint(effectiveDate: string | null, value: number): void {
    if (effectiveDate === null) {
      // Update baseline
      const baselineIndex = this.points.findIndex(p => p.effectiveDate === null);
      if (baselineIndex >= 0) {
        this.points[baselineIndex].value = value;
      } else {
        this.points.unshift({ effectiveDate: null, value });
      }
    } else {
      // Check if point already exists for this date
      const existingIndex = this.points.findIndex(p => p.effectiveDate === effectiveDate);
      if (existingIndex >= 0) {
        this.points[existingIndex].value = value;
      } else {
        this.points.push({ effectiveDate, value });
      }
    }
    this.sortPoints();
  }

  /**
   * Get the value applicable at a given month (YYYY-MM format).
   * Returns the most recent value that has taken effect by that month.
   */
  getValueAt(month: string): number {
    let result = this.getBaselineValue();

    for (const point of this.points) {
      if (point.effectiveDate === null) {
        continue;
      }
      // If the effective date is <= the query month, use this value
      if (point.effectiveDate <= month) {
        result = point.value;
      } else {
        // Points are sorted, so we can stop once we pass the query month
        break;
      }
    }

    return result;
  }

  /**
   * Get the baseline (initial) value.
   */
  getBaselineValue(): number {
    const baseline = this.points.find(p => p.effectiveDate === null);
    return baseline ? baseline.value : 0;
  }

  /**
   * Check if there are any future scheduled changes.
   */
  hasFutureChanges(): boolean {
    return this.points.some(p => p.effectiveDate !== null);
  }

  /**
   * Get all points (for debugging or aggregation).
   */
  getPoints(): ReadonlyArray<TimePoint> {
    return this.points;
  }

  /**
   * Get all unique dates in this series (excluding null/baseline).
   */
  getScheduledDates(): string[] {
    return this.points
      .filter(p => p.effectiveDate !== null)
      .map(p => p.effectiveDate as string);
  }

  /**
   * Get the final date in the series or undefined if the series is empty.
   */
  getFinalDate(): string {
    const dates = this.getScheduledDates();
    return dates[dates.length - 1];
  }

  /**
   * Subtracts the value of the points in a series
   */
  subtract(points: TimeSeries): TimeSeries {
    const allDates = new Set<string>([
      ...this.getScheduledDates(),
      ...points.getScheduledDates(),
    ]);

    const result = new TimeSeries(this.getBaselineValue() - points.getBaselineValue());

    Array.from(allDates).sort().forEach(date => {
      const value = this.getValueAt(date) - points.getValueAt(date);
      
      const existingPoint = result.points.find(p => p.effectiveDate === date);
      if (existingPoint) {
        existingPoint.value = value; // update
      } else {
        result.addPoint(date, value); // add new
      }
    });

    return result;
  }

  /**
   * Create a new TimeSeries with all values offset by a given amount.
   * Useful for applying a manual adjustment while preserving scheduled changes.
   */
  offset(amount: number): TimeSeries {
    const result = new TimeSeries(this.getBaselineValue() + amount);
    for (const point of this.points) {
      if (point.effectiveDate !== null) {
        result.addPoint(point.effectiveDate, point.value + amount);
      }
    }
    return result;
  }

  private sortPoints(): void {
    this.points.sort((a, b) => {
      if (a.effectiveDate === null) return -1;
      if (b.effectiveDate === null) return 1;
      return a.effectiveDate.localeCompare(b.effectiveDate);
    });
  }
}

/**
 * Aggregate multiple time series into a single series by summing values at each point.
 * The resulting series has the union of all dates from input series.
 */
export function aggregateTimeSeries(seriesList: TimeSeries[]): TimeSeries {
  if (!seriesList || seriesList.length === 0) {
    return new TimeSeries(0);
  }

  // Collect all unique dates across all series
  const allDates = new Set<string>();
  for (const series of seriesList) {
    for (const date of series.getScheduledDates()) {
      allDates.add(date);
    }
  }

  // Sum baseline values
  const baselineSum = seriesList.reduce((sum, series) => sum + series.getBaselineValue(), 0);
  const result = new TimeSeries(baselineSum);

  // For each date, calculate the sum of all series' values at that date
  const sortedDates = Array.from(allDates).sort();
  for (const date of sortedDates) {
    const sumAtDate = seriesList.reduce((sum, series) => sum + series.getValueAt(date), 0);
    result.addPoint(date, sumAtDate);
  }

  return result;
}

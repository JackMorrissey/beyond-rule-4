import { TimeSeries, aggregateTimeSeries } from './time-series.model';

describe('TimeSeries', () => {
  describe('constructor', () => {
    it('should create with default baseline of 0', () => {
      const series = new TimeSeries();
      expect(series.getBaselineValue()).toBe(0);
    });

    it('should create with specified baseline', () => {
      const series = new TimeSeries(100);
      expect(series.getBaselineValue()).toBe(100);
    });
  });

  describe('addPoint', () => {
    it('should add a scheduled point', () => {
      const series = new TimeSeries(100);
      series.addPoint('2025-06', 200);
      expect(series.hasFutureChanges()).toBe(true);
      expect(series.getScheduledDates()).toEqual(['2025-06']);
    });

    it('should update baseline when adding null date point', () => {
      const series = new TimeSeries(100);
      series.addPoint(null, 150);
      expect(series.getBaselineValue()).toBe(150);
    });

    it('should update existing point for same date', () => {
      const series = new TimeSeries(100);
      series.addPoint('2025-06', 200);
      series.addPoint('2025-06', 300);
      expect(series.getScheduledDates()).toEqual(['2025-06']);
      expect(series.getValueAt('2025-06')).toBe(300);
    });

    it('should sort points chronologically', () => {
      const series = new TimeSeries(100);
      series.addPoint('2026-01', 300);
      series.addPoint('2025-06', 200);
      expect(series.getScheduledDates()).toEqual(['2025-06', '2026-01']);
    });
  });

  describe('getValueAt', () => {
    it('should return baseline for dates before any scheduled changes', () => {
      const series = new TimeSeries(100);
      series.addPoint('2025-06', 200);
      expect(series.getValueAt('2024-01')).toBe(100);
      expect(series.getValueAt('2025-05')).toBe(100);
    });

    it('should return scheduled value for dates on or after the effective date', () => {
      const series = new TimeSeries(100);
      series.addPoint('2025-06', 200);
      expect(series.getValueAt('2025-06')).toBe(200);
      expect(series.getValueAt('2025-07')).toBe(200);
      expect(series.getValueAt('2026-01')).toBe(200);
    });

    it('should return most recent applicable value', () => {
      const series = new TimeSeries(100);
      series.addPoint('2025-06', 200);
      series.addPoint('2026-01', 300);
      expect(series.getValueAt('2025-05')).toBe(100);
      expect(series.getValueAt('2025-06')).toBe(200);
      expect(series.getValueAt('2025-12')).toBe(200);
      expect(series.getValueAt('2026-01')).toBe(300);
      expect(series.getValueAt('2030-01')).toBe(300);
    });

    it('should handle value dropping to zero', () => {
      const series = new TimeSeries(500);
      series.addPoint('2030-01', 0);
      expect(series.getValueAt('2029-12')).toBe(500);
      expect(series.getValueAt('2030-01')).toBe(0);
      expect(series.getValueAt('2035-01')).toBe(0);
    });
  });

  describe('hasFutureChanges', () => {
    it('should return false when no scheduled changes', () => {
      const series = new TimeSeries(100);
      expect(series.hasFutureChanges()).toBe(false);
    });

    it('should return true when there are scheduled changes', () => {
      const series = new TimeSeries(100);
      series.addPoint('2025-06', 200);
      expect(series.hasFutureChanges()).toBe(true);
    });
  });
});

describe('aggregateTimeSeries', () => {
  it('should return empty series for empty input', () => {
    const result = aggregateTimeSeries([]);
    expect(result.getBaselineValue()).toBe(0);
    expect(result.hasFutureChanges()).toBe(false);
  });

  it('should sum baseline values', () => {
    const series1 = new TimeSeries(100);
    const series2 = new TimeSeries(200);
    const series3 = new TimeSeries(300);
    const result = aggregateTimeSeries([series1, series2, series3]);
    expect(result.getBaselineValue()).toBe(600);
  });

  it('should aggregate scheduled changes', () => {
    const series1 = new TimeSeries(100);
    series1.addPoint('2025-06', 200);

    const series2 = new TimeSeries(300);
    // series2 has no changes

    const result = aggregateTimeSeries([series1, series2]);
    expect(result.getBaselineValue()).toBe(400); // 100 + 300
    expect(result.getValueAt('2025-05')).toBe(400);
    expect(result.getValueAt('2025-06')).toBe(500); // 200 + 300
  });

  it('should handle multiple series with different change dates', () => {
    const series1 = new TimeSeries(100);
    series1.addPoint('2025-06', 200);

    const series2 = new TimeSeries(300);
    series2.addPoint('2026-01', 0);

    const result = aggregateTimeSeries([series1, series2]);
    expect(result.getValueAt('2025-05')).toBe(400); // 100 + 300
    expect(result.getValueAt('2025-06')).toBe(500); // 200 + 300
    expect(result.getValueAt('2026-01')).toBe(200); // 200 + 0
  });

  it('should handle overlapping change dates', () => {
    const series1 = new TimeSeries(100);
    series1.addPoint('2025-06', 200);

    const series2 = new TimeSeries(300);
    series2.addPoint('2025-06', 400);

    const result = aggregateTimeSeries([series1, series2]);
    expect(result.getValueAt('2025-05')).toBe(400); // 100 + 300
    expect(result.getValueAt('2025-06')).toBe(600); // 200 + 400
  });
});

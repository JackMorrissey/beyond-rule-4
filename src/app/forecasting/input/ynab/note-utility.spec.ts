import NoteUtility from './note-utility';

describe('NoteUtility', () => {
  describe('getNoteOverrides', () => {
    describe('basic parsing (existing functionality)', () => {
      it('should return undefined values for empty note', () => {
        const result = NoteUtility.getNoteOverrides('', 100);
        expect(result.contributionBudget).toBeUndefined();
        expect(result.computedFiBudget).toBeUndefined();
        expect(result.computedLeanFiBudget).toBeUndefined();
        expect(result.monthlyContribution).toBeUndefined();
      });

      it('should return undefined values for note without BR4', () => {
        const result = NoteUtility.getNoteOverrides('Some random note', 100);
        expect(result.contributionBudget).toBeUndefined();
      });

      it('should parse contribution override with +', () => {
        const result = NoteUtility.getNoteOverrides('BR4 + 500', 100);
        expect(result.contributionBudget).toBe(500);
      });

      it('should parse FI budget override', () => {
        const result = NoteUtility.getNoteOverrides('BR4 FI 200', 100);
        expect(result.computedFiBudget).toBe(200);
      });

      it('should parse lean FI budget override', () => {
        const result = NoteUtility.getNoteOverrides('BR4 LFI 150', 100);
        expect(result.computedLeanFiBudget).toBe(150);
      });

      it('should parse monthly contribution override', () => {
        const result = NoteUtility.getNoteOverrides('BR4 +m 300', 100);
        expect(result.monthlyContribution).toBe(300);
      });

      it('should use original value when no amount specified', () => {
        const result = NoteUtility.getNoteOverrides('BR4 +', 100);
        expect(result.contributionBudget).toBe(100);
      });

      it('should be case insensitive', () => {
        const result = NoteUtility.getNoteOverrides('br4 + 500', 100);
        expect(result.contributionBudget).toBe(500);
      });
    });

    describe('date-prefixed parsing (new functionality)', () => {
      it('should parse contribution with date prefix', () => {
        const result = NoteUtility.getNoteOverrides('BR4 2025-06 + 1000', 100);
        expect(result.contributionBudget).toBeUndefined();
        expect(result.contributionBudgetSchedule.schedule).toEqual([
          { effectiveDate: '2025-06', value: 1000 }
        ]);
      });

      it('should parse baseline and scheduled contribution', () => {
        const result = NoteUtility.getNoteOverrides('BR4 + 500 BR4 2025-06 + 1000', 100);
        expect(result.contributionBudget).toBe(500);
        expect(result.contributionBudgetSchedule.baseline).toBe(500);
        expect(result.contributionBudgetSchedule.schedule).toEqual([
          { effectiveDate: '2025-06', value: 1000 }
        ]);
      });

      it('should parse FI expense with scheduled drop to zero', () => {
        const result = NoteUtility.getNoteOverrides('BR4 FI 200 BR4 2030-01 FI 0', 100);
        expect(result.computedFiBudget).toBe(200);
        expect(result.computedFiBudgetSchedule.baseline).toBe(200);
        expect(result.computedFiBudgetSchedule.schedule).toEqual([
          { effectiveDate: '2030-01', value: 0 }
        ]);
      });

      it('should parse lean FI expense with scheduled change', () => {
        const result = NoteUtility.getNoteOverrides('BR4 LFI 100 BR4 2028-06 LFI 50', 100);
        expect(result.computedLeanFiBudget).toBe(100);
        expect(result.computedLeanFiBudgetSchedule.baseline).toBe(100);
        expect(result.computedLeanFiBudgetSchedule.schedule).toEqual([
          { effectiveDate: '2028-06', value: 50 }
        ]);
      });

      it('should parse multiple scheduled changes', () => {
        const result = NoteUtility.getNoteOverrides(
          'BR4 + 500 BR4 2025-06 + 800 BR4 2026-01 + 1000',
          100
        );
        expect(result.contributionBudget).toBe(500);
        expect(result.contributionBudgetSchedule.schedule).toEqual([
          { effectiveDate: '2025-06', value: 800 },
          { effectiveDate: '2026-01', value: 1000 }
        ]);
      });

      it('should handle mixed override types with dates', () => {
        const result = NoteUtility.getNoteOverrides(
          'BR4 + 500 BR4 FI 200 BR4 2030-01 FI 0',
          100
        );
        expect(result.contributionBudget).toBe(500);
        expect(result.computedFiBudget).toBe(200);
        expect(result.computedFiBudgetSchedule.schedule).toEqual([
          { effectiveDate: '2030-01', value: 0 }
        ]);
      });

      it('should handle date with colon separator', () => {
        const result = NoteUtility.getNoteOverrides('BR4: 2025-06: + 1000', 100);
        expect(result.contributionBudgetSchedule.schedule).toEqual([
          { effectiveDate: '2025-06', value: 1000 }
        ]);
      });

      it('should handle negative values', () => {
        const result = NoteUtility.getNoteOverrides('BR4 + -100', 100);
        expect(result.contributionBudget).toBe(-100);
      });

      it('should handle decimal values', () => {
        const result = NoteUtility.getNoteOverrides('BR4 FI 199.99', 100);
        expect(result.computedFiBudget).toBe(199.99);
      });
    });

    describe('schedule initialization', () => {
      it('should always initialize schedule objects', () => {
        const result = NoteUtility.getNoteOverrides('BR4 + 500', 100);
        expect(result.contributionBudgetSchedule).toBeDefined();
        expect(result.contributionBudgetSchedule.schedule).toEqual([]);
        expect(result.computedFiBudgetSchedule).toBeDefined();
        expect(result.computedFiBudgetSchedule.schedule).toEqual([]);
        expect(result.computedLeanFiBudgetSchedule).toBeDefined();
        expect(result.computedLeanFiBudgetSchedule.schedule).toEqual([]);
        expect(result.monthlyContributionSchedule).toBeDefined();
        expect(result.monthlyContributionSchedule.schedule).toEqual([]);
      });

      it('should set baseline in schedule when parsing non-dated override', () => {
        const result = NoteUtility.getNoteOverrides('BR4 + 500', 100);
        expect(result.contributionBudgetSchedule.baseline).toBe(500);
      });
    });
  });
});

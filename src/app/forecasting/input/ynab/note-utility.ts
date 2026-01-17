export interface ScheduledValue {
  effectiveDate: string;
  value: number;
}

export interface TimeVaryingOverride {
  baseline: number | undefined;
  schedule: ScheduledValue[];
}

export interface Overrides {
  contributionBudget: number;
  computedLeanFiBudget: number;
  computedFiBudget: number;
  monthlyContribution: number;
  contributionBudgetSchedule: TimeVaryingOverride;
  computedFiBudgetSchedule: TimeVaryingOverride;
  computedLeanFiBudgetSchedule: TimeVaryingOverride;
  monthlyContributionSchedule: TimeVaryingOverride;
}

export default class NoteUtility {
  public static getNoteOverrides(
    note: string,
    originalValue: number
  ): Overrides {
    const override: Overrides = {
      contributionBudget: undefined,
      computedLeanFiBudget: undefined,
      computedFiBudget: undefined,
      monthlyContribution: undefined, // used on accounts to implicitly add a contribution
      contributionBudgetSchedule: { baseline: undefined, schedule: [] },
      computedFiBudgetSchedule: { baseline: undefined, schedule: [] },
      computedLeanFiBudgetSchedule: { baseline: undefined, schedule: [] },
      monthlyContributionSchedule: { baseline: undefined, schedule: [] },
    };

    if (!note) {
      return override;
    }

    const commands = this.getCommands(note, originalValue);

    commands.forEach((c) => {
      switch (c.key) {
        case '+':
        case 'c':
        case 'contribution':
          if (c.effectiveDate) {
            override.contributionBudgetSchedule.schedule.push({
              effectiveDate: c.effectiveDate,
              value: c.value,
            });
          } else {
            override.contributionBudget = c.value;
            override.contributionBudgetSchedule.baseline = c.value;
          }
          break;
        case 'l':
        case 'lfi':
        case 'lean':
          if (c.effectiveDate) {
            override.computedLeanFiBudgetSchedule.schedule.push({
              effectiveDate: c.effectiveDate,
              value: c.value,
            });
          } else {
            override.computedLeanFiBudget = c.value;
            override.computedLeanFiBudgetSchedule.baseline = c.value;
          }
          break;
        case 'f':
        case 'fi':
          if (c.effectiveDate) {
            override.computedFiBudgetSchedule.schedule.push({
              effectiveDate: c.effectiveDate,
              value: c.value,
            });
          } else {
            override.computedFiBudget = c.value;
            override.computedFiBudgetSchedule.baseline = c.value;
          }
          break;
        case '+m':
          if (c.effectiveDate) {
            override.monthlyContributionSchedule.schedule.push({
              effectiveDate: c.effectiveDate,
              value: c.value,
            });
          } else {
            override.monthlyContribution = c.value;
            override.monthlyContributionSchedule.baseline = c.value;
          }
          break;
        default:
          break;
      }
    });

    return override;
  }

  private static getCommands(originalNote: string, originValue: number) {
    const note = originalNote.toLowerCase();
    const commandPrefix = 'br4';
    if (note.indexOf(commandPrefix) === -1) {
      return [];
    }

    const lines = note.split(commandPrefix);
    if (!lines || !lines.length) {
      return [];
    }

    // Date prefix regex: matches "YYYY-MM" at the start of a command
    const dateRegex = /^\s*(\d{4}-\d{2})\s*/;

    return lines
      .map((line) => {
        let cleaned = line.replace(/\:/g, ' ').replace(/\s+/g, ' ').trim();

        // Check for date prefix
        let effectiveDate: string | null = null;
        const dateMatch = dateRegex.exec(cleaned);
        if (dateMatch) {
          effectiveDate = dateMatch[1];
          // Remove the date from the line for further processing
          cleaned = cleaned.substring(dateMatch[0].length).trim();
        }

        const numRegex = /[+-]?\d+(?:\.\d+)?/g;
        const match = numRegex.exec(cleaned);
        if (!match || !match.length) {
          return {
            key: cleaned,
            value: originValue,
            effectiveDate,
          };
        }
        const foundValue = match[0];
        const key = cleaned.substring(0, cleaned.indexOf(foundValue)).trim();
        const value = Number(foundValue);
        return {
          key,
          value,
          effectiveDate,
        };
      })
      .filter((l) => l.key);
  }
}

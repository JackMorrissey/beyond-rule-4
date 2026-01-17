import * as ynab from 'ynab';
import { CategoryBudgetInfo } from './category-budget-info';
import NoteUtility from './note-utility';

export default class CategoryUtility {
  private static hiddenCategoryGroups = ['internal master category', '👻'];
  private static contributionCategoryGroups = [
    'fire',
    'financial independence',
    'investments',
    'retirement',
    '📈',
    '🔥',
  ];
  private static ignoredCategoryGroups = [
    'credit card payments',
    'debt payments',
    '📉',
    '🔕',
  ];
  private static leanFiIgnoredCategoryGroups = [
    'just for fun',
    'quality of life goals',
    '🌤️',
  ];

  public static mapCategoryGroups(
    categoryGroupsWithCategories: ynab.CategoryGroupWithCategories[],
    monthDetails: ynab.MonthDetail[],
    includeHiddenYnabCategories: boolean
  ) {
    if (!categoryGroupsWithCategories || !monthDetails) {
      return [];
    }
    const categoryGroups = categoryGroupsWithCategories.map((c) => {
      const lowerName = c.name.toLowerCase();
      const isOfHiddenCategoryGroups = !!this.hiddenCategoryGroups.find((g) =>
        lowerName.includes(g)
      );
      const isContribution = !!this.contributionCategoryGroups.find((g) =>
        lowerName.includes(g)
      );
      const isOfIgnoredCategoryGroups = !!this.ignoredCategoryGroups.find((g) =>
        lowerName.includes(g)
      );
      const isCategoryDirectlyHidden = !includeHiddenYnabCategories && c.hidden;
      const generalIgnore =
        isCategoryDirectlyHidden ||
        isOfHiddenCategoryGroups ||
        isContribution ||
        isOfIgnoredCategoryGroups;
      const leanFiIgnore =
        generalIgnore ||
        !!this.leanFiIgnoredCategoryGroups.find((g) => lowerName.includes(g));
      const mappedCategories = c.categories.map((ca) =>
        this.mapCategory(
          ca,
          monthDetails,
          generalIgnore,
          leanFiIgnore,
          isContribution,
          includeHiddenYnabCategories
        )
      );
      const hidden =
        isCategoryDirectlyHidden ||
        isOfHiddenCategoryGroups ||
        mappedCategories.every((mc) => mc.hidden);
      return {
        name: c.name,
        id: c.id,
        hidden,
        categories: mappedCategories,
        isContribution,
        generalIgnore,
        leanFiIgnore,
      };
    });

    // @ts-ignore (deleted isn't in current ynab import)
    return categoryGroups.filter((c) => !c.hidden && !c.deleted);
  }

  private static mapCategory(
    category: ynab.Category,
    monthDetails: ynab.MonthDetail[],
    childrenIgnore: boolean,
    leanFiIgnore: boolean,
    isContribution: boolean,
    includeHiddenYnabCategories: boolean
  ) {
    const isCategoryDirectlyHidden =
      !includeHiddenYnabCategories && category.hidden;
    let ignore = childrenIgnore || isCategoryDirectlyHidden;
    const categoryBudgetInfo = new CategoryBudgetInfo(category, monthDetails);
    const retrievedBudgeted = categoryBudgetInfo.mean;

    if (retrievedBudgeted < 0) {
      // Do not know how to handle negative contributions or budgeting
      // This typically happens if you're moving money around in your budget for the month
      // Default it to 0 but allow overrides
      ignore = true;
    }

    const overrides = NoteUtility.getNoteOverrides(
      categoryBudgetInfo.categoryNote,
      retrievedBudgeted
    );

    let computedFiBudget = ignore ? 0 : retrievedBudgeted;
    if (overrides.computedFiBudget !== undefined) {
      computedFiBudget = overrides.computedFiBudget;
    }

    let computedLeanFiBudget = leanFiIgnore ? 0 : computedFiBudget;
    if (overrides.computedLeanFiBudget !== undefined) {
      computedLeanFiBudget = overrides.computedLeanFiBudget;
    }

    let contributionBudget = isContribution ? retrievedBudgeted : 0;
    if (overrides.contributionBudget !== undefined) {
      contributionBudget = overrides.contributionBudget;
    }

    // Build schedule data for time-varying values
    const contributionBudgetSchedule = {
      baseline: contributionBudget,
      schedule: overrides.contributionBudgetSchedule.schedule,
    };
    const computedFiBudgetSchedule = {
      baseline: computedFiBudget,
      schedule: overrides.computedFiBudgetSchedule.schedule,
    };
    const computedLeanFiBudgetSchedule = {
      baseline: computedLeanFiBudget,
      schedule: overrides.computedLeanFiBudgetSchedule.schedule,
    };

    return Object.assign({
      name: category.name,
      ignore,
      hidden: isCategoryDirectlyHidden,
      id: category.id,
      retrievedBudgeted,
      computedFiBudget,
      computedLeanFiBudget,
      contributionBudget,
      info: categoryBudgetInfo,
      contributionBudgetSchedule,
      computedFiBudgetSchedule,
      computedLeanFiBudgetSchedule,
    });
  }
}

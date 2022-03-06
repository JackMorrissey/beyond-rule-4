import { MonthDetail } from 'ynab';
export interface SelectedMonths {
  from: MonthDetail;
  to: MonthDetail;
}
export type QuickSelectMonthChoice =
  | 'all'
  | 'allTrim'
  | 'yr'
  | '12'
  | 'ytd'
  | 'curr'
  | 'previousChoice';

export const getSelectedMonths = (
  currentMonth: MonthDetail,
  months: MonthDetail[],
  selectedChoice: QuickSelectMonthChoice
): SelectedMonths => {
  let currentMonthIdx = 0;

  let choice = selectedChoice;
  if (choice !== 'previousChoice') {
    window.localStorage.setItem('br4-quick-months', choice);
  }
  if (selectedChoice === 'previousChoice') {
    const fromStorage = window.localStorage.getItem('br4-quick-months');
    if (fromStorage) {
      choice = fromStorage as QuickSelectMonthChoice;
    } else {
      choice = 'curr';
    }
  }

  for (let i = 0; i < months.length; i++) {
    if (currentMonth.month === months[i].month) {
      currentMonthIdx = i;
      break;
    }
  }

  switch (choice) {
    case 'all':
      return {
        from: months[months.length - 1],
        to: months[0],
      };
    case 'allTrim':
      {
        const fromIndex = months.length - 2;
        const toIndex = currentMonthIdx + 1;
        if (fromIndex < toIndex) {
          // bail back to All
          return {
            from: months[months.length - 1],
            to: months[0],
          };
        }
        return {
          from: months[fromIndex],
          to: months[toIndex],
        };
      }
      return {
        from: months[months.length - 1],
        to: months[0],
      };
    case 'yr':
      // Go to current month, work backwards to prev Dec, then calc from there.
      //Note: Adding 1 to current month, in case this is december. We would want last year's december
      for (let i = currentMonthIdx + 1; i < months.length; i++) {
        if (months[i].month.endsWith('-12-01')) {
          const startMonthIndex = Math.min(i + 11, months.length - 1); //Don't go too far into past
          return {
            from: months[startMonthIndex],
            to: months[i],
          };
        }
      }
      break;
    case '12':
      const startMonthIdx = Math.min(currentMonthIdx + 11, months.length - 1); //Don't go too far into past
      return {
        from: months[startMonthIdx],
        to: currentMonth,
      };
    case 'ytd': {
      // Go to current month, work backwards to prev Jan.
      for (let i = currentMonthIdx; i < months.length; i++) {
        if (months[i].month.endsWith('-01-01')) {
          return {
            from: months[i],
            to: currentMonth,
          };
        }
      }
      return {
        from: currentMonth,
        to: currentMonth,
      };
    }
    case 'curr':
    default:
      return {
        from: currentMonth,
        to: currentMonth,
      };
  }
  return;
};

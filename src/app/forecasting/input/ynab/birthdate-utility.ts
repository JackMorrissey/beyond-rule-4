export type Birthdate = {
  year: number;
  month: number;
  day: number;
};

/**
 * Converts a Birthdate object to a JavaScript Date object.
 * @param birthdate The Birthdate object to convert.
 * @returns A Date object representing the same date.
 */
export function birthdateToDate(birthdate: Birthdate): Date {
  try {
    return new Date(birthdate.year, birthdate.month - 1, birthdate.day);
  } catch (e) {
    return null;
  }
}

/**
 * Converts a JavaScript Date object to a Birthdate object.
 * @param date The Date object to convert.
 * @returns A Birthdate object representing the same date.
 */
export function dateToBirthdate(date: Date): Birthdate {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1, // Months are 0-based in JavaScript
    day: date.getDate(),
  };
}

export default class NoteUtility {
  public static getNoteOverrides(note: string, originalValue: number) {
    const override = {
      contributionBudget: undefined,
      computedLeanFiBudget: undefined,
      computedFiBudget: undefined
    };

    if (!note) {
      return override;
    }

    const commands = this.getCommands(note, originalValue);

    commands.forEach(c => {
      switch (c.key) {
        case '+':
        case 'c':
        case 'contribution':
          override.contributionBudget = c.value;
          break;
        case 'l':
        case 'lfi':
        case 'lean':
          override.computedLeanFiBudget = c.value;
          break;
        case 'f':
        case 'fi':
          override.computedFiBudget = c.value;
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

    return lines.map(line => {
      const cleaned = line.replace(/\:/g, ' ').replace(/\s+/g, ' ').trim();
      const numRegex = /[+-]?\d+(?:\.\d+)?/g;
      const match = numRegex.exec(cleaned);
      if (!match || !match.length) {
        return {
          key: cleaned,
          value: originValue
        };
      }
      const foundValue = match[0];
      const key = cleaned.substr(0, cleaned.indexOf(foundValue)).trim();
      const value = Number(foundValue);
      return {
        key,
        value
      };
    }).filter(l => l.key);
  }
}

import { round } from '../../utilities/number-utility';

export class Milestones {
  milestones: Milestone[];

  public constructor(public fiNumber: number, public leanFiNumber) {
    this.milestones = this.calculateMilestones(fiNumber, leanFiNumber);
  }

  private calculateMilestones(fiNumber, leanFiNumber) {
    const milestones: Milestone[] = [
      new Milestone('FU$', round(fiNumber * 0.1)), // 2.5
      new Milestone('Half FI', round(fiNumber * 0.5)), // 12.5
      new Milestone('FI', round(fiNumber)), // 25x
      new Milestone('Flex FI', round(fiNumber * 0.8)), // 20x
      new Milestone('Fat FI', round(fiNumber * 1.2)), // 30x
    ];
    if (fiNumber !== leanFiNumber) {
      milestones.push(new Milestone('Lean FI', round(leanFiNumber))); // 0.7 * FI)
    }
    return milestones;
  }
}

export class Milestone {
  constructor(public label: string, public value: number) {}
}

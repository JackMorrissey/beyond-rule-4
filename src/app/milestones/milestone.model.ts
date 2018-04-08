import { round } from '../utilities/number-utility';

export class Milestones {
  milestones: Milestone[];

  public constructor(public fiNumber: number, public leanFiPercentage: number = 0.7) {
    this.milestones = this.calculateMilestones(fiNumber, leanFiPercentage);
  }

  private calculateMilestones(fiNumber, leanFiPercentage) {
    const milestones: Milestone[] = [
      new Milestone('FU$', round(fiNumber * 0.1)), // 2.5
      new Milestone('Half FI', round(fiNumber * 0.5)), // 12.5
      new Milestone('Lean FI', round(fiNumber * leanFiPercentage)),
      new Milestone('Flex FI', round(fiNumber * 0.8)), // 20x
      new Milestone('FI', round(fiNumber)), // 25x
      new Milestone('Fat FI', round(fiNumber * 1.2)), // 30x
    ];
    return milestones;
  }
}

export class Milestone {
  constructor(public label: string, public value: number) {}
}

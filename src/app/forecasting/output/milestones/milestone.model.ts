import { round } from '../../utilities/number-utility';

export class Milestones {
  milestones: Milestone[];

  public constructor(
    public fiNumber: number,
    public leanFiNumber: number,
    public eclipseNumber: number,
    public coastFiNumber: number | null = null
  ) {
    this.milestones = this.calculateMilestones(
      fiNumber,
      leanFiNumber,
      eclipseNumber,
      coastFiNumber
    );
  }

  private calculateMilestones(
    fiNumber: number,
    leanFiNumber: number,
    eclipseNumber: number,
    coastFiNumber: number | null
  ) {
    const milestones: Milestone[] = [
      new Milestone('FU$', round(fiNumber * 0.1)), // 2.5
      new Milestone('Half FI', round(fiNumber * 0.5)), // 12.5
      new Milestone('FI', round(fiNumber)), // 25x
      new Milestone('Flex FI', round(fiNumber * 0.8)), // 20x
      new Milestone('Fat FI', round(fiNumber * 1.2)), // 30x
      new Milestone('1.5x FI', round(fiNumber * 1.5)),
    ];
    if (fiNumber !== leanFiNumber) {
      milestones.push(new Milestone('Lean FI', round(leanFiNumber))); // 0.7 * FI)
    }
    if (coastFiNumber !== null && coastFiNumber > 0) {
      milestones.push(new Milestone('Coast FI', round(coastFiNumber)));
    }
    if (eclipseNumber) {
      milestones.push(
        new Milestone('Contribution / Returns Eclipse', round(eclipseNumber))
      );
    }
    return milestones;
  }
}

export class Milestone {
  constructor(public label: string, public value: number) {}
}

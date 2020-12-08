import { PlanningReportModule } from './planning-report.module';

describe('PlanningReportModule', () => {
  let planningReportModule: PlanningReportModule;

  beforeEach(() => {
    planningReportModule = new PlanningReportModule();
  });

  it('should create an instance', () => {
    expect(planningReportModule).toBeTruthy();
  });
});

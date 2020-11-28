import { NewPlanningModule } from './new-planning.module';

describe('NewPlanningModule', () => {
  let newPlanningModule: NewPlanningModule;

  beforeEach(() => {
    newPlanningModule = new NewPlanningModule();
  });

  it('should create an instance', () => {
    expect(newPlanningModule).toBeTruthy();
  });
});

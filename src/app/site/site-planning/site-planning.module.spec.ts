import { SitePlanningModule } from './site-planning.module';

describe('SitePlanningModule', () => {
  let sitePlanningModule: SitePlanningModule;

  beforeEach(() => {
    sitePlanningModule = new SitePlanningModule();
  });

  it('should create an instance', () => {
    expect(sitePlanningModule).toBeTruthy();
  });
});

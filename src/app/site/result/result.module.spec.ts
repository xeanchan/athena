import { ResultModule } from './result.module';

describe('ResultModule', () => {
  let resultModule: ResultModule;

  beforeEach(() => {
    resultModule = new ResultModule();
  });

  it('should create an instance', () => {
    expect(resultModule).toBeTruthy();
  });
});

import { View3dModule } from './view3d.module';

describe('View3dModule', () => {
  let view3dModule: View3dModule;

  beforeEach(() => {
    view3dModule = new View3dModule();
  });

  it('should create an instance', () => {
    expect(view3dModule).toBeTruthy();
  });
});

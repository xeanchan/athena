/**
 * 場域form
 */
export class CalculateForm {

  sessionid: string = null;
  taskName: string = null;
  totalRound: number = 1;
  mapName: string = '';
  mapImage: string = null;
  createTime = null;
  crossover: number = 0.8;
  mutation: number = 0.4;
  iteration: number = 100;
  seed: number = 10;
  defaultBs: string = null;
  candidateBs: string = null;
  width: number = null;
  height: number = null;
  altitude: number = null;
  zValue: string = null;
  pathLossModelId: number = 0;
  ueCoordinate: string = null;
  useUeCoordinate: number = 1;
  powerMaxRange: number = null;
  powerMinRange: number = null;
  beamMaxId: number = null;
  beamMinId: number = null;
  objectiveIndex = '2';
  // threshold = null;
  obstacleInfo: string = null;
  availableNewBsNumber: number = 0;
  addFixedBsNumber: number = 0;
  bandwidth: number = null;
  frequency: number = null;
  isAverageSinr = true;
  sinrRatio: number = 5;
  isAvgThroughput = false;
  throughputRatio: number = 5;
  isCoverage: boolean = false;
  coverageRatio: number = 0.95;
  isUeCoverage = false;
  ueCoverageRatio: number = 0.95;
  isUeAvgSinr: boolean = true;
  ueAvgSinrRatio: number = 16;
  isUeAvgThroughput: boolean = false;
  ueAvgThroughputRatio: number = 100;
  isUeTpByDistance: boolean = false;
  ueTpByDistanceRatio: number = 100;
  isUeTpByRsrp: boolean = false;
  ueTpByRsrpRatio: number = 100;
  // modelname: string = null;
  // distanceFactor: number = null;
  // contantFactor: number = null;
  mctsC: number = 1.2;
  mctsMimo: number = 2;
  mctsTemperature: number = 300;
  mctsTime: number = 30;
  mctsTestTime: number = 300;
  mctsTotalTime: number = 500;

  // constructor(options: {
  //   sessionid?: string,
  //   taskName?: string,
  //   totalRound?: number,
  //   mapName?: string,
  //   mapImage?: string,
  //   // createTime?: string,
  //   crossover?: number,
  //   mutation?: number,
  //   iteration?: number,
  //   seed?: number,
  //   defaultBs?: string,
  //   candidateBs?: string,
  //   width?: number,
  //   height?: number,
  //   altitude?: number,
  //   zValue?: string,
  //   pathLossModelId?: number,
  //   ueCoordinate?: string,
  //   useUeCoordinate?: number,
  //   powerMaxRange?: number,
  //   powerMinRange?: number,
  //   beamMaxId?: number,
  //   beamMinId?: number,
  //   objectiveIndex?: number,
  //   // threshold?: number,
  //   obstacleInfo?: string,
  //   availableNewBsNumber?: number,
  //   addFixedBsNumber?: number,
  //   bandwidth?: number,
  //   Frequency?: number
  // } = {}) {
  //     this.sessionid = options.sessionid;
  //     this.taskName = options.taskName;
  //     this.mapName = options.mapName;
  //     this.mapImage = options.mapImage;
  //     // this.createTime = options.createTime;
  //     this.crossover = options.crossover;
  //     this.mutation = options.mutation;
  //     this.iteration = options.iteration;
  //     this.seed = options.seed;
  //     this.defaultBs = options.defaultBs;
  //     this.candidateBs = options.candidateBs;
  //     this.width = options.width;
  //     this.height = options.height;
  //     this.altitude = options.altitude;
  //     this.zValue = options.zValue;
  //     this.pathLossModelId = options.pathLossModelId;
  //     this.ueCoordinate = options.ueCoordinate;
  //     this.useUeCoordinate = options.useUeCoordinate;
  //     this.powerMaxRange = options.powerMaxRange;
  //     this.powerMinRange = options.powerMinRange;
  //     this.beamMaxId = options.beamMaxId;
  //     this.beamMinId = options.beamMinId;
  //     this.objectiveIndex = options.objectiveIndex;
  //     // this.threshold = options.threshold;
  //     this.obstacleInfo = options.obstacleInfo;
  //     this.availableNewBsNumber = options.availableNewBsNumber;
  //     this.addFixedBsNumber = options.addFixedBsNumber;
  //     this.bandwidth = options.bandwidth;
  //     this.Frequency = options.Frequency;
  // }

}

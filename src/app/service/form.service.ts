import { Injectable } from '@angular/core';
import { CalculateForm } from '../form/CalculateForm';

/**
 * Form service
 */
@Injectable({
  providedIn: 'root'
})
export class FormService {

  constructor() { }

  /** 歷史資料回寫CalculateForm */
  setHstToForm(result) {
    const calculateForm = new CalculateForm();
    calculateForm.addFixedBsNumber = result['addfixedbsnumber'];
    calculateForm.availableNewBsNumber = result['availablenewbsnumber'];
    calculateForm.bandwidth = result['bandwidth'];
    calculateForm.beamMaxId = result['beammaxid'];
    calculateForm.beamMinId = result['beamminid'];
    calculateForm.candidateBs = result['candidatebs'];
    calculateForm.crossover = result['crossover'];
    calculateForm.defaultBs = result['defaultbs'];
    calculateForm.frequency = result['frequency'];
    calculateForm.iteration = result['iteration'];
    calculateForm.zValue = result['mapdepth'];
    calculateForm.altitude = result['mapaltitude'];
    calculateForm.height = result['mapheight'];
    calculateForm.mapImage = result['mapimage'];
    calculateForm.mapName = result['mapname'];
    calculateForm.width = result['mapwidth'];
    calculateForm.mutation = result['mutation'];
    calculateForm.objectiveIndex = result['objectiveindex'];
    calculateForm.obstacleInfo = result['obstacleinfo'];
    calculateForm.pathLossModelId = result['pathlossmodelid'];
    calculateForm.powerMaxRange = result['powermaxrange'];
    calculateForm.powerMinRange = result['powerminrange'];
    calculateForm.seed = result['seed'];
    calculateForm.taskName = result['taskname'];
    calculateForm.totalRound = result['totalround'];
    calculateForm.ueCoordinate = result['uecoordinate'];
    calculateForm.useUeCoordinate = result['useuecoordinate'];
    calculateForm.beamMaxId = result['beammaxid'];

    return calculateForm;
  }

  /** 轉換跟結果一樣的key */
  setHstOutputToResultOutput(result) {
    const output = {};
    output['averageRsrp'] = result['averagersrp'];
    output['averageSinr'] = result['averagesinr'];
    output['candidateBeamId'] = result['candidatebeamid'];
    output['candidateBsPower'] = result['candidatebs_power'];
    output['candidateConnection'] = result['candidateconnection'];
    output['candidateThroughput'] = result['candidatethroughput'];
    output['chosenCandidate'] = result['chosecandidate'];
    output['connectionMap'] = result['connectionmap'];
    output['connectionMapAll'] = result['connectionmapall'];
    output['coverage'] = result['coverage'];
    output['cqiCount'] = result['cqicount'];
    output['cqiMap'] = result['cqimap'];
    output['defaultBeamId'] = result['defaultbeamid'];
    output['defaultBs'] = result['defaultbs'];
    output['defaultBsPower'] = result['defaultbspower'];
    output['defaultConnection'] = result['defaultconnection'];
    output['defaultThroughput'] = result['defaultthroughput'];
    output['layeredAverageRsrp'] = result['layeredaveragersrp'];
    output['layeredAverageSinr'] = result['layeredaveragesinr'];
    output['layeredCoverage'] = result['layeredcoverage'];
    output['layeredCqiCount'] = result['layeredcqicount'];
    output['layeredMcsCount'] = result['layeredmcscount'];
    output['layeredModulationCount'] = result['layeredmodulationcount'];
    output['layeredSignalLevelCount'] = result['layeredsignallevelcount'];
    output['layeredThroughput'] = result['layeredthroughput'];
    output['mcsCount'] = result['mcscount'];
    output['mcsMap'] = result['mcsmap'];
    output['modulationCount'] = result['modulationcount'];
    output['modulationMap'] = result['modulationmap'];
    output['rsrpMap'] = result['rsrpmap'];
    output['signalLevelCount'] = result['signallevelcount'];
    output['signalLevelMap'] = result['signallevelmap'];
    output['sinrMap'] = result['sinrmap'];
    output['throughput'] = result['throughput'];
    output['throughputMap'] = result['throughputmap'];
    output['ueAverageRsrp'] = result['ueaveragersrp'];
    output['ueAverageSinr'] = result['ueaveragesinr'];
    output['ueConnection'] = result['ueconnection'];
    output['ueCoverage'] = result['uecoverage'];
    output['ueCqi'] = result['uecqi'];
    output['ueCqiCount'] = result['uecqicount'];
    output['ueMcs'] = result['uemcs'];
    output['ueMcsCount'] = result['uemcscount'];
    output['ueModulation'] = result['uemodulation'];
    output['ueModulationCount'] = result['uemodulationcount'];
    output['ueRsrp'] = result['uersrp'];
    output['ueSignalLevel'] = result['uesignallevel'];
    output['ueSignalLevelCount'] = result['uesignallevelcount'];
    output['ueSinr'] = result['uesinr'];
    output['ueThroughput'] = result['uethroughput'];
    output['ueThroughputIndividual'] = result['uethroughputindividual'];

    return output;
  }
}

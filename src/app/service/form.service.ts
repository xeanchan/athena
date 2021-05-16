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

  /**
   * 歷史資料回寫CalculateForm
   * @param result 
   */
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
    calculateForm.createTime = result['createtime'];

    return calculateForm;
  }

  /**
   * 轉換跟結果一樣的key
   * @param result 
   */
  setHstOutputToResultOutput(result) {
    const output = {};
    output['averageRsrp'] = result['averagersrp'];
    output['averageSinr'] = result['averagesinr'];
    if (typeof result['candidatebeamid'] !== 'undefined') {
      output['candidateBeamId'] = JSON.parse(result['candidatebeamid']);
    }
    if (typeof result['candidatebs_power'] !== 'undefined') {
      output['candidateBsPower'] = JSON.parse(result['candidatebs_power']);
    }
    if (typeof result['candidateconnection'] !== 'undefined') {
      output['candidateConnection'] = JSON.parse(result['candidateconnection']);
    }
    if (typeof result['candidatethroughput'] !== 'undefined') {
      output['candidateThroughput'] = JSON.parse(result['candidatethroughput']);
    }

    output['chosenCandidate'] = JSON.parse(result['chosecandidate']);
    output['connectionMap'] = JSON.parse(result['connectionmap']);
    output['connectionMapAll'] = JSON.parse(result['connectionmapall']);
    output['coverage'] = result['coverage'];
    output['cqiCount'] = result['cqicount'];
    output['cqiMap'] = JSON.parse(result['cqimap']);
    output['defaultBeamId'] = JSON.parse(result['defaultbeamid']);
    output['defaultBs'] = JSON.parse(result['defaultbs']);
    output['defaultBsPower'] = JSON.parse(result['defaultbspower']);
    output['defaultConnection'] = JSON.parse(result['defaultconnection']);
    output['defaultThroughput'] = JSON.parse(result['defaultthroughput']);
    output['layeredAverageRsrp'] = JSON.parse(result['layeredaveragersrp']);
    output['layeredAverageSinr'] = JSON.parse(result['layeredaveragesinr']);
    output['layeredCoverage'] = JSON.parse(result['layeredcoverage']);
    output['layeredCqiCount'] = JSON.parse(result['layeredcqicount']);
    output['layeredMcsCount'] = JSON.parse(result['layeredmcscount']);
    output['layeredModulationCount'] = JSON.parse(result['layeredmodulationcount']);
    output['layeredSignalLevelCount'] = JSON.parse(result['layeredsignallevelcount']);
    output['layeredThroughput'] = JSON.parse(result['layeredthroughput']);
    output['mcsCount'] = result['mcscount'];
    output['mcsMap'] = JSON.parse(result['mcsmap']);
    output['modulationCount'] = result['modulationcount'];
    output['modulationMap'] = JSON.parse(result['modulationmap']);
    output['rsrpMap'] = JSON.parse(result['rsrpmap']);
    output['signalLevelCount'] = result['signallevelcount'];
    output['signalLevelMap'] = JSON.parse(result['signallevelmap']);
    output['sinrMap'] = JSON.parse(result['sinrmap']);
    output['throughput'] = result['throughput'];
    output['throughputMap'] = JSON.parse(result['throughputmap']);
    output['ueAverageRsrp'] = result['ueaveragersrp'];
    if (output['ueAverageRsrp'] === 'null') {
      output['ueAverageRsrp'] = null;
    }
    output['ueAverageSinr'] = result['ueaveragesinr'];
    if (output['ueAverageSinr'] === 'null') {
      output['ueAverageSinr'] = null;
    }
    output['ueConnection'] = result['ueconnection'];
    output['ueCoverage'] = result['uecoverage'];
    if (output['ueCoverage'] === 'null') {
      output['ueCoverage'] = null;
    }
    output['ueCqi'] = result['uecqi'];
    output['ueCqiCount'] = JSON.parse(result['uecqicount']);
    output['ueMcs'] = result['uemcs'];
    output['ueMcsCount'] = JSON.parse(result['uemcscount']);
    output['ueModulation'] = result['uemodulation'];
    output['ueModulationCount'] = JSON.parse(result['uemodulationcount']);
    output['ueRsrp'] = JSON.parse(result['uersrp']);
    output['ueSignalLevel'] = JSON.parse(result['uesignallevel']);
    output['ueSignalLevelCount'] = JSON.parse(result['uesignallevelcount']);
    output['ueSinr'] = JSON.parse(result['uesinr']);
    output['ueThroughput'] = result['uethroughput'];
    if (output['ueThroughput'] === 'null') {
      output['ueThroughput'] = null;
    }
    output['ueThroughputIndividual'] = result['uethroughputindividual'];

    return output;
  }
}

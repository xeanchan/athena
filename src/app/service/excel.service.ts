import { Injectable } from '@angular/core';
import { CalculateForm } from '../form/CalculateForm';
import * as XLSX from 'xlsx';
import { AuthService } from './auth.service';

/**
 * export excel
 */
@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  constructor(private authService: AuthService) { }

  /**
   * export excel
   * @param calculateForm 
   */
  export(calculateForm: CalculateForm) {
    console.log(calculateForm);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    const zValues = JSON.parse(calculateForm.zValue);
    const mapData = [
      ['image', 'imageName', 'width', 'height', 'altitude', 'protocol', 'mapLayer'],
      [
        calculateForm.mapImage,
        calculateForm.mapName,
        calculateForm.width,
        calculateForm.height,
        calculateForm.altitude,
        calculateForm.objectiveIndex,
        zValues[0]
      ]
    ];
    if (zValues.length > 1) {
      for (let i = 1; i < zValues.length; i++) {
        mapData.push([
          '', '', '', '', '', '', zValues[i]
        ]);
      }
    }
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(mapData);
    XLSX.utils.book_append_sheet(wb, ws, 'map');
    // defaultBS
    const baseStationData = [['x', 'y', 'z', 'material', 'color']];

    if (!this.authService.isEmpty(calculateForm.defaultBs)) {
      const defaultBs = calculateForm.defaultBs.split('|');
      for (const item of defaultBs) {
        const data = JSON.parse(item);
        baseStationData.push([
          data[0], data[1], data[2], data[3]
        ]);
      }
    }
    const baseStationWS: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(baseStationData);
    XLSX.utils.book_append_sheet(wb, baseStationWS, 'base_station');
    // candidate
    const candidateData = [['x', 'y', 'z', 'material', 'color']];
    if (!this.authService.isEmpty(calculateForm.candidateBs)) {
      const candidate = calculateForm.candidateBs.split('|');
      for (const item of candidate) {
        const data = JSON.parse(item);
        candidateData.push([
          data[0], data[1], data[2], data[3]
        ]);
      }
    }
    const candidateWS: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(candidateData);
    XLSX.utils.book_append_sheet(wb, candidateWS, 'candidate');
    // UE
    const ueData = [['x', 'y', 'z', 'material', 'color']];
    if (!this.authService.isEmpty(calculateForm.ueCoordinate)) {
      const ue = calculateForm.ueCoordinate.split('|');
      for (const item of ue) {
        const data = JSON.parse(item);
        ueData.push([
          data[0], data[1], data[2], data[3]
        ]);
      }
    }
    const ueWS: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(ueData);
    XLSX.utils.book_append_sheet(wb, ueWS, 'ue');
    // obstacle
    const obstacleData = [['x', 'y', 'width', 'height', 'altitude', 'rotate', 'material', 'color', 'shape']];
    if (!this.authService.isEmpty(calculateForm.obstacleInfo)) {
      const obstacleInfo = calculateForm.obstacleInfo.split('|');
      for (const item of obstacleInfo) {
        const data = JSON.parse(item);
        if (typeof item[7] !== 'undefined') {
          obstacleData.push([
            data[0], data[1], data[2], data[3], data[4], data[5], data[6], 'rgb(115, 128, 92)', data[7]
          ]);
        } else {
          obstacleData.push([
            data[0], data[1], data[2], data[3], data[4], data[5], data[6]
          ]);
        }
      }
    }
    const obstacleWS: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(obstacleData);
    XLSX.utils.book_append_sheet(wb, obstacleWS, 'obstacle');
    // bs parameters
    const bsData = [
      ['bsPowerMax', 'bsPowerMin', 'bsBeamIdMax', 'bsBeamIdMin', 'bandwidth', 'frequency'],
      [
        calculateForm.powerMaxRange, calculateForm.powerMinRange,
        // calculateForm.beamMaxId, calculateForm.beamMinId,
        '', '',
        calculateForm.bandwidth, calculateForm.frequency
      ]
    ];
    const bsWS: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(bsData);
    XLSX.utils.book_append_sheet(wb, bsWS, 'bs parameters');
    // algorithm parameters

    const algorithmData = [
      ['crossover', 'mutation', 'iteration', 'seed', 'computeRound', 'useUeCoordinate', 'pathLossModel'],
      [
        calculateForm.crossover, calculateForm.mutation,
        calculateForm.iteration, calculateForm.seed,
        1, calculateForm.useUeCoordinate, calculateForm.pathLossModelId
      ]
    ];
    const algorithmWS: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(algorithmData);
    XLSX.utils.book_append_sheet(wb, algorithmWS, 'algorithm parameters');
    // objective parameters
    const objectiveData = [
      ['objective', 'objectiveStopCondition', 'newBsNum'],
      [calculateForm.objectiveIndex, '', calculateForm.availableNewBsNumber]
    ];
    const objectiveWS: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(objectiveData);
    XLSX.utils.book_append_sheet(wb, objectiveWS, 'objective parameters');
    console.log(wb);
    /* save to file */
    XLSX.writeFile(wb, `${calculateForm.taskName}.xlsx`);
  }
}

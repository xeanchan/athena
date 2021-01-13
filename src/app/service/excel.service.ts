import { Injectable } from '@angular/core';
import { CalculateForm } from '../form/CalculateForm';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  constructor() { }

  export(calculateForm: CalculateForm) {
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    const mapData = [
      ['image', 'width', 'height', 'altitude', 'mapLayer', 'imageName', 'zValue'],
      [
        calculateForm.mapImage, calculateForm.width,
        calculateForm.height, calculateForm.altitude,
        1, calculateForm.mapName, calculateForm.zValue.replace('[', '').replace('', ']')
      ]
    ];
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(mapData);
    XLSX.utils.book_append_sheet(wb, ws, 'map');
    // defaultBS
    const baseStationData = [['x', 'y', 'z', 'material', 'color']];
    if (calculateForm.defaultBs != null) {
      let str = calculateForm.defaultBs.replace(new RegExp('[', 'gi'), '');
      str = str.replace(new RegExp(']', 'gi'), '');
      const ary = str.split('|');
      for (const item of ary) {
        const data = item.split(',');
        baseStationData.push([
          data[0], data[1], data[2], data[3]
        ]);
      }
    }
    const baseStationWS: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(baseStationData);
    XLSX.utils.book_append_sheet(wb, baseStationWS, 'base_station');
    // candidate
    const candidateData = [['x', 'y', 'z', 'material', 'color']];
    if (calculateForm.candidateBs != null) {
      let str = calculateForm.candidateBs.replace(new RegExp('[', 'gi'), '');
      str = str.replace(new RegExp(']', 'gi'), '');
      const ary = str.split('|');
      for (const item of ary) {
        const data = item.split(',');
        candidateData.push([
          data[0], data[1], data[2], data[3]
        ]);
      }
    }
    const candidateWS: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(candidateData);
    XLSX.utils.book_append_sheet(wb, candidateWS, 'candidate');
    // UE
    const ueData = [['x', 'y', 'z', 'material', 'color']];
    if (calculateForm.ueCoordinate != null) {
      let str = calculateForm.ueCoordinate.replace(new RegExp('[', 'gi'), '');
      str = str.replace(new RegExp(']', 'gi'), '');
      const ary = str.split('|');
      for (const item of ary) {
        const data = item.split(',');
        ueData.push([
          data[0], data[1], data[2], data[3]
        ]);
      }
    }
    const ueWS: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(ueData);
    XLSX.utils.book_append_sheet(wb, ueWS, 'ue');
    // obstacle
    const obstacleData = [['x', 'y', 'width', 'height', 'altitude', 'rotate', 'material', 'color', 'shape']];
    if (calculateForm.obstacleInfo != null) {
      let str = calculateForm.obstacleInfo.replace(new RegExp('[', 'gi'), '');
      str = str.replace(new RegExp(']', 'gi'), '');
      const ary = str.split('|');
      for (const item of ary) {
        const data = item.split(',');
        obstacleData.push([
          data[0], data[1], data[2], data[3], data[4], data[5], data[6]
        ]);
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
        calculateForm.bandwidth, calculateForm.Frequency
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

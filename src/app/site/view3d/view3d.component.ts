import { Component, OnInit, Inject } from '@angular/core';
import { CalculateForm } from '../../form/CalculateForm';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import * as _ from 'lodash';
// import { Scene, Engine } from 'babylonjs';

import * as BABYLON from 'babylonjs';
import * as Earcut from 'earcut';
import { Engine } from 'babylonjs';

declare const Plotly: any;

@Component({
  selector: 'app-view3d',
  templateUrl: './view3d.component.html',
  styleUrls: ['./view3d.component.scss']
})
export class View3dComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private router: Router,
    private matDialog: MatDialog,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data) {

      this.calculateForm = data.calculateForm;
      this.obstacle = data.obstacleList;
      this.defaultBs = data.defaultBSList;
      this.candidate = data.candidateList;
      this.ue = data.ueList;
      this.width = this.calculateForm.width;
      this.height = this.calculateForm.height;
      this.zValue = data.zValue;
      this.planeHeight = this.zValue[0].toString();
      this.result = data.result;
console.log(this.result)      
    }

  calculateForm: CalculateForm;
  /** 障礙物 */
  obstacleList = [];
  /** 現有基站 */
  defaultBSList = [];
  /** 新增基站 */
  candidateList = [];
  /** 新增ＵＥ */
  ueList = [];
  dragObject = {};

  zValue = [];
  engine = null;
  scene = null;
  obstacleGroup = [];
  defaultBsGroup = [];
  candidateGroup = [];
  ueGroup = [];
  heatmapGroup = {};
  showDefaultBs = true;
  showCandidate = true;
  showUe = true;
  showObstacle = true;
  heatmapType = 0;     // 0 = SINR, 1 = PCI, 2 = RSRP
  planeHeight;
  width = 0;
  height = 0;
  obstacle = [];
  defaultBs = [];
  candidate = [];
  ue = [];
  result = {};
  // heatmapConfig = {
  //   container: document.getElementById('heatmap'),
  //   radius: 5,
  //   maxOpacity: .8,
  //   minOpacity: .8,
  //   blur: 0,
  //   gradient: {
  //     // plotly js 'portland' setup
  //     0: 'rgb(12, 51, 131)',
  //     0.25: 'rgb(10,136,186)',
  //     0.5: 'rgb(242,211,56)',
  //     0.75: 'rgb(242,143,56)',
  //     1: 'rgb(217,30,30)'
  //   }
  // };
  heatmapConfig = [[12, 51, 131], [10, 136, 186], [242, 211, 56], [242, 143, 56], [217, 30, 30]];

  ngOnInit() {
    // this.draw();
    this.mounted();
  }

  createScene() {
    const canvas = <HTMLCanvasElement> document.getElementById('canvas');
    this.engine = new BABYLON.Engine(canvas, true);
    const scene = new BABYLON.Scene(this.engine);
    console.log(canvas.width);
    console.log(scene.clearColor);
    scene.clearColor = new BABYLON.Color4(1, 1, 1, 1);

    const camera = new BABYLON.ArcRotateCamera('Camera', -Math.PI / 2, Math.PI * 0.37, this.width / 1.5, new BABYLON.Vector3(10, 0, 0), scene);
    camera.position = new BABYLON.Vector3(this.width * 0.4, 35, -60);
    camera.lowerRadiusLimit = 30;
    camera.upperRadiusLimit = 100;
    camera.lowerBetaLimit = 0.00 * (Math.PI / 180);
    camera.upperBetaLimit = 90.00 * (Math.PI / 180);
    camera.panningInertia = 0.5;
    camera.inertia = 0.5;
    camera.angularSensibilityX = 500;
    camera.angularSensibilityY = 500;
    camera.panningSensibility = 50;
    camera.attachControl(canvas, true);
    console.log(camera);

    const light = new BABYLON.HemisphericLight('hemiLight', new BABYLON.Vector3(-10, 10, 0), scene);

    // offset
    const offsetX = this.width / -2;
    const offsetY = -5;
    const offsetZ = this.height / -2;

    // floor
    const floorData = [
        new BABYLON.Vector3(this.width, 0, 0),
        new BABYLON.Vector3(this.width, 0, this.height),
        new BABYLON.Vector3(0, 0, this.height),
        new BABYLON.Vector3(0, 0, 0)
    ];
    const floor = BABYLON.MeshBuilder.ExtrudePolygon('floor', {shape: floorData, depth: 0.3}, scene, Earcut);
    floor.position.x = offsetX;
    floor.position.y = offsetY;
    floor.position.z = offsetZ;
    const floorMat = new BABYLON.StandardMaterial('floorMaterial', scene);
    floorMat.diffuseColor = new BABYLON.Color3(248 / 255, 248 / 255, 248 / 255);
    floor.material = floorMat;

    const obstacleMat = new BABYLON.StandardMaterial('obstacleMaterial', scene);
    obstacleMat.diffuseColor = new BABYLON.Color3(121 / 255, 221 / 255, 242 / 255);
    for (const item of this.obstacle) {
      // const item = this.obstacle[id];
      // const item = this.dragObject[id];
      const depth = item.altitude / 2;
      const obstacleData = [
          new BABYLON.Vector3(-depth, 0, 0),
          new BABYLON.Vector3(depth, 0, 0),
          new BABYLON.Vector3(depth, 0, item.height),
          new BABYLON.Vector3(-depth, 0, item.height)
      ];
      const obstacle = BABYLON.MeshBuilder.ExtrudePolygon('obstacle', {shape: obstacleData, depth: item.width}, scene, Earcut);
      obstacle.position.x = item.x + offsetX;
      obstacle.position.y = depth + offsetY;
      obstacle.position.z = item.y + offsetZ;
      obstacle.rotation.z = Math.PI / 2;
      obstacle.material = obstacleMat;

      this.obstacleGroup.push(obstacle);
    }

    const defaultBsMat = new BABYLON.StandardMaterial('defaultBsMaterial', scene);
    defaultBsMat.diffuseColor = new BABYLON.Color3(0, 1, 0);
    for (const id of this.defaultBs) {
      // const bs = this.defaultBs[id];
      const bs = this.dragObject[id];
      const bsBox = BABYLON.BoxBuilder.CreateBox('defaultBs', {size: 1}, scene);
      bsBox.position = new BABYLON.Vector3(bs.x + offsetX, 3 + offsetY, bs.y + offsetZ);
      bsBox.material = defaultBsMat;

      this.defaultBsGroup.push(bsBox);
    }

    const candidateMat = new BABYLON.StandardMaterial('candidateMaterial', scene);
    candidateMat.diffuseColor = new BABYLON.Color3(1, 0, 0);
    const chosenMat = new BABYLON.StandardMaterial('chosenMaterial', scene);
    chosenMat.diffuseColor = new BABYLON.Color3(0, 0, 1);
    for (const candidate of this.candidate) {
        // const candidate = this.candidate[id];
        // const candidate = this.dragObject[id];
        const candBox = BABYLON.BoxBuilder.CreateBox('candidate', {size: 1}, scene);
        candBox.position = new BABYLON.Vector3(candidate.x + offsetX, candidate.z + offsetY, candidate.y + offsetZ);
        if (null != this.result['gaResult']) {
          for (const chosen of this.result['gaResult'].chosenCandidate) {
            if (candidate.x === chosen[0] && candidate.y === chosen[1] && candidate.z === chosen[2]) {
              candBox.material = chosenMat;
              break;
            } else {
              candBox.material = candidateMat;
            }
          }

        } else {
            candBox.material = candidateMat;
        }

        this.candidateGroup.push(candBox);
    }

    const ueMat = new BABYLON.StandardMaterial('ueMaterial', scene);
    ueMat.diffuseColor = new BABYLON.Color3(1, 1, 0);
    for (const ue of this.ue) {
      // const ue = this.ue[id];
      // const ue = this.dragObject[id];
      const uePoint = BABYLON.SphereBuilder.CreateSphere('ue', {diameter: 0.5}, scene);
      uePoint.position = new BABYLON.Vector3(ue.x + offsetX, ue.z + offsetY, ue.y + offsetZ);
      uePoint.material = ueMat;

      this.ueGroup.push(uePoint);
    }

    for (let i = 0; i < this.zValue.length; i++) {
        const z = this.zValue[i];
        this.heatmapGroup[z] = [];

        const sinrMapPlane = BABYLON.MeshBuilder.CreateGround('sinrmap_' + z, {width: this.width, height: this.height}, scene);
        sinrMapPlane.position.y = z + offsetY;
        if (null != this.result['gaResult']) {
            const heatmapMat = new BABYLON.StandardMaterial('heatmapMaterial', scene);
            const texture = BABYLON.RawTexture.CreateRGBTexture(this.genSinrMapData(i), this.width, this.height, scene, false, false);
            heatmapMat.diffuseTexture = texture;
            sinrMapPlane.material = heatmapMat;
        }
        sinrMapPlane.isVisible = false;
        this.heatmapGroup[z].push(sinrMapPlane);

        const pciMapPlane = BABYLON.MeshBuilder.CreateGround('pcimap_' + z, {width: this.width, height: this.height}, scene);
        pciMapPlane.position.y = z + offsetY;
        if (null != this.result['gaResult']) {
            const heatmapMat = new BABYLON.StandardMaterial('heatmapMaterial', scene);
            const texture = BABYLON.RawTexture.CreateRGBTexture(this.genPciMapData(i), this.width, this.height, scene, false, false);
            heatmapMat.diffuseTexture = texture;
            pciMapPlane.material = heatmapMat;
        }
        pciMapPlane.isVisible = false;
        this.heatmapGroup[z].push(pciMapPlane);

        const rsrpMapPlane = BABYLON.MeshBuilder.CreateGround('rsrpmap_' + z, {width: this.width, height: this.height}, scene);
        rsrpMapPlane.position.y = z + offsetY;
        if (null != this.result['gaResult']) {
            const heatmapMat = new BABYLON.StandardMaterial('heatmapMaterial', scene);
            const texture = BABYLON.RawTexture.CreateRGBTexture(this.genRsrpMapData(i), this.width, this.height, scene, false, false);
            heatmapMat.diffuseTexture = texture;
            rsrpMapPlane.material = heatmapMat;
        }
        rsrpMapPlane.isVisible = false;
        this.heatmapGroup[z].push(rsrpMapPlane);
    }
    return scene;
  }

  switchObstacle() {
    for (const id of this.obstacleGroup){
      id.isVisible = !id.isVisible;
    }
  }

  switchDefaultBs() {
    for (const id of this.defaultBsGroup) {
      id.isVisible = !id.isVisible;
    }
  }
  switchCandidate() {
    for (const id of this.candidateGroup){
      id.isVisible = !id.isVisible;
    }
  }
  switchUe() {
    for (const id of this.ueGroup){
      id.isVisible = !id.isVisible;
    }
  }

  switchHeatMap() {
    Object.keys(this.heatmapGroup).forEach(id => {
      for (let i = 0; i < 3; i++) {
        if (id === this.planeHeight && i === Number(this.heatmapType)) {
          this.heatmapGroup[id][i].isVisible = true;
        } else {
          this.heatmapGroup[id][i].isVisible = false;
        }
      }
    });
  }

  genPciMapData(zIndex) {
    const blockCount = this.defaultBs.length + this.result['gaResult'].chosenCandidate.length;
    const colorMap = new Uint8Array(this.width * this.height * 3);
    for (let j = 0; j < this.height; j++) {
        for (let i = 0; i < this.width; i++) {
            const n = (j * this.width + i) * 3;
            const value = this.result['gaResult'].connectionMapAll[i][j][zIndex];
            const offset = (value + 1) / blockCount;
            if (offset < 0.25) {
                const mixRatio = offset / 0.25;
                colorMap[n] = mixRatio * (this.heatmapConfig[1][0] - 255) + 255;
                colorMap[n + 1] = mixRatio * (this.heatmapConfig[1][1] - 255) + 255;
                colorMap[n + 2] = mixRatio * (this.heatmapConfig[1][2] - 255) + 255;
            } else if (offset < 0.5) {
                const mixRatio = (offset - 0.25) / 0.25;
                colorMap[n] = mixRatio * (this.heatmapConfig[2][0] - this.heatmapConfig[1][0]) + this.heatmapConfig[1][0];
                colorMap[n + 1] = mixRatio * (this.heatmapConfig[2][1] - this.heatmapConfig[1][1]) + this.heatmapConfig[1][1];
                colorMap[n + 2] = mixRatio * (this.heatmapConfig[2][2] - this.heatmapConfig[1][2]) + this.heatmapConfig[1][2];
            } else if (offset < 0.75) {
                const mixRatio = (offset - 0.5) / 0.25;
                colorMap[n] = mixRatio * (this.heatmapConfig[3][0] - this.heatmapConfig[2][0]) + this.heatmapConfig[2][0];
                colorMap[n + 1] = mixRatio * (this.heatmapConfig[3][1] - this.heatmapConfig[2][1]) + this.heatmapConfig[2][1];
                colorMap[n + 2] = mixRatio * (this.heatmapConfig[3][2] - this.heatmapConfig[2][2]) + this.heatmapConfig[2][2];
            } else {
                const mixRatio = (offset - 0.75) / 0.25;
                colorMap[n] = mixRatio * (this.heatmapConfig[4][0] - this.heatmapConfig[3][0]) + this.heatmapConfig[3][0];
                colorMap[n + 1] = mixRatio * (this.heatmapConfig[4][1] - this.heatmapConfig[3][1]) + this.heatmapConfig[3][1];
                colorMap[n + 2] = mixRatio * (this.heatmapConfig[4][2] - this.heatmapConfig[3][2]) + this.heatmapConfig[3][2];
            }
        }
    }
    return colorMap;
  }

  genSinrMapData(zIndex) {
    const colorMap = new Uint8Array(this.width * this.height * 3);
    const totalDelta = this.result['sinrMax'] - this.result['sinrMin'];
    for (let j = 0; j < this.height; j++) {
        for (let i = 0; i < this.width; i++) {
            const n = (j * this.width + i) * 3;
            const value = this.result['gaResult'].sinrMap[i][j][zIndex];
            const offset = (value - this.result['sinrMin']) / totalDelta;
            if (offset < 0.25) {
                const mixRatio = offset / 0.25;
                colorMap[n] = mixRatio * (this.heatmapConfig[1][0] - this.heatmapConfig[0][0]) + this.heatmapConfig[0][0];
                colorMap[n + 1] = mixRatio * (this.heatmapConfig[1][1] - this.heatmapConfig[0][1]) + this.heatmapConfig[0][1];
                colorMap[n + 2] = mixRatio * (this.heatmapConfig[1][2] - this.heatmapConfig[0][2]) + this.heatmapConfig[0][2];
            } else if (offset < 0.5) {
                const mixRatio = (offset - 0.25) / 0.25;
                colorMap[n] = mixRatio * (this.heatmapConfig[2][0] - this.heatmapConfig[1][0]) + this.heatmapConfig[1][0];
                colorMap[n + 1] = mixRatio * (this.heatmapConfig[2][1] - this.heatmapConfig[1][1]) + this.heatmapConfig[1][1];
                colorMap[n + 2] = mixRatio * (this.heatmapConfig[2][2] - this.heatmapConfig[1][2]) + this.heatmapConfig[1][2];
            } else if (offset < 0.75) {
                const mixRatio = (offset - 0.5) / 0.25;
                colorMap[n] = mixRatio * (this.heatmapConfig[3][0] - this.heatmapConfig[2][0]) + this.heatmapConfig[2][0];
                colorMap[n + 1] = mixRatio * (this.heatmapConfig[3][1] - this.heatmapConfig[2][1]) + this.heatmapConfig[2][1];
                colorMap[n + 2] = mixRatio * (this.heatmapConfig[3][2] - this.heatmapConfig[2][2]) + this.heatmapConfig[2][2];
            } else {
                const mixRatio = (offset - 0.75) / 0.25;
                colorMap[n] = mixRatio * (this.heatmapConfig[4][0] - this.heatmapConfig[3][0]) + this.heatmapConfig[3][0];
                colorMap[n + 1] = mixRatio * (this.heatmapConfig[4][1] - this.heatmapConfig[3][1]) + this.heatmapConfig[3][1];
                colorMap[n + 2] = mixRatio * (this.heatmapConfig[4][2] - this.heatmapConfig[3][2]) + this.heatmapConfig[3][2];
            }
        }
    }
    return colorMap;
  }


  genRsrpMapData(zIndex) {
    const colorMap = new Uint8Array(this.width * this.height * 3);
    const totalDelta = this.result['rsrpMax'] - this.result['rsrpMin'];
    for (let j = 0; j < this.height; j++) {
        for (let i = 0; i < this.width; i++) {
            const n = (j * this.width + i) * 3;
            const value = this.result['gaResult'].rsrpMap[i][j][zIndex];
            const offset = (value - this.result['rsrpMin']) / totalDelta;
            if (offset < 0.25) {
                const mixRatio = offset / 0.25;
                colorMap[n] = mixRatio * (this.heatmapConfig[1][0] - this.heatmapConfig[0][0]) + this.heatmapConfig[0][0];
                colorMap[n + 1] = mixRatio * (this.heatmapConfig[1][1] - this.heatmapConfig[0][1]) + this.heatmapConfig[0][1];
                colorMap[n + 2] = mixRatio * (this.heatmapConfig[1][2] - this.heatmapConfig[0][2]) + this.heatmapConfig[0][2];
            } else if (offset < 0.5) {
                const mixRatio = (offset - 0.25) / 0.25;
                colorMap[n] = mixRatio * (this.heatmapConfig[2][0] - this.heatmapConfig[1][0]) + this.heatmapConfig[1][0];
                colorMap[n + 1] = mixRatio * (this.heatmapConfig[2][1] - this.heatmapConfig[1][1]) + this.heatmapConfig[1][1];
                colorMap[n + 2] = mixRatio * (this.heatmapConfig[2][2] - this.heatmapConfig[1][2]) + this.heatmapConfig[1][2];
            } else if (offset < 0.75) {
                const mixRatio = (offset - 0.5) / 0.25;
                colorMap[n] = mixRatio * (this.heatmapConfig[3][0] - this.heatmapConfig[2][0]) + this.heatmapConfig[2][0];
                colorMap[n + 1] = mixRatio * (this.heatmapConfig[3][1] - this.heatmapConfig[2][1]) + this.heatmapConfig[2][1];
                colorMap[n + 2] = mixRatio * (this.heatmapConfig[3][2] - this.heatmapConfig[2][2]) + this.heatmapConfig[2][2];
            } else {
                const mixRatio = (offset - 0.75) / 0.25;
                colorMap[n] = mixRatio * (this.heatmapConfig[4][0] - this.heatmapConfig[3][0]) + this.heatmapConfig[3][0];
                colorMap[n + 1] = mixRatio * (this.heatmapConfig[4][1] - this.heatmapConfig[3][1]) + this.heatmapConfig[3][1];
                colorMap[n + 2] = mixRatio * (this.heatmapConfig[4][2] - this.heatmapConfig[3][2]) + this.heatmapConfig[3][2];
            }
        }
    }
    return colorMap;
  }

  mounted() {
    console.log('mounted');
    const vm = this;
    this.scene = this.createScene();
    console.log(this.scene);
    this.engine.runRenderLoop(() => {
        vm.scene.render();
    });
    window.addEventListener('resize', () => {
        vm.engine.resize();
    });
  }

  close() {
    this.matDialog.closeAll();
  }

}

import { Component, OnInit, Inject, Optional, ViewChild, ElementRef } from '@angular/core';
import { CalculateForm } from '../../form/CalculateForm';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as BABYLON from 'babylonjs';
import * as Earcut from 'earcut';

/**
 * View 3D
 */
@Component({
  selector: 'app-view3d',
  templateUrl: './view3d.component.html',
  styleUrls: ['./view3d.component.scss']
})
export class View3dComponent implements OnInit {

  constructor(
    private matDialog: MatDialog,
    @Optional() @Inject(MAT_DIALOG_DATA) public data) {

      if (data != null) {
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
        this.isPDF = false;
        window.setTimeout(() => {
          this.mounted();
        }, 100);
      }

    }

  /** 結果form */
  calculateForm: CalculateForm;
  /** 障礙物 */
  obstacleList = [];
  /** 現有基站 */
  defaultBSList = [];
  /** 新增基站 */
  candidateList = [];
  /** 新增ＵＥ */
  ueList = [];
  /** 互動的物件 */
  dragObject = {};
  /** 高度list */
  zValue = [];
  /** BABYLON engine */
  engine = null;
  /** BABYLON scene */
  scene = null;
  /** 障礙物 group */
  obstacleGroup = [];
  /** 現有基站 group */
  defaultBsGroup = [];
  /** 新增AP group */
  candidateGroup = [];
  /** 行動終端 group */
  ueGroup = [];
  /** heatmap group */
  heatmapGroup = {};
  /** 顯示現有基站 */
  showDefaultBs = true;
  /** 顯示AP */
  showCandidate = true;
  /** 顯示行動終端 */
  showUe = true;
  /** 顯有障礙物 */
  showObstacle = true;
  /** 0 = SINR, 1 = PCI, 2 = RSRP */
  heatmapType = 0;
  /** heatmap height */
  planeHeight;
  /** 圖寬 */
  width = 0;
  /** 圖高 */
  height = 0;
  /** 障礙物 list */
  obstacle = [];
  /** 現有基站 list */
  defaultBs = [];
  /** 新增AP list */
  candidate = [];
  /** 行動終端 list */
  ue = [];
  /** 結果data */
  result = {};
  /** 是否PDF */
  isPDF = false;
  /** heatmap config */
  heatmapConfig = [[12, 51, 131], [10, 136, 186], [242, 211, 56], [242, 143, 56], [217, 30, 30]];

  /** canvas element */
  @ViewChild('canvas', { static: true }) 
  canvas: ElementRef<HTMLCanvasElement>;

  /** image element */
  @ViewChild('img')
  img: ElementRef<HTMLImageElement>;

  ngOnInit() {
    // this.draw();
    
  }

  /**
   * 畫圖
   */
  createScene() {

    this.engine = new BABYLON.Engine(this.canvas.nativeElement, true);
    const scene = new BABYLON.Scene(this.engine);
    console.log(this.canvas.nativeElement.width);
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
    camera.attachControl(this.canvas.nativeElement, true);
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
      // console.log(item)
      if (item.rotate !== 0) {
        // if (item.rotate < 0) {
          
        // }
        obstacle.rotation.y = item.rotate * (Math.PI / 180);
        // console.log(item.rotate)
        if (item.rotate < 0 || item.rotate > 90) {
          obstacle.position.z = item.y + offsetZ - (obstacle.rotation.y);
        } else {
          obstacle.position.z = item.y + offsetZ + 7;
        }
        obstacle.position.x = item.x + offsetX + 2;
        // console.log(item.rotate, obstacle.rotation.y, obstacle.position.z)
        // obstacle.rotate(obstacleData[3], item.rotate);
        // obstacle.addRotation(item.rotate, 0, 0);
        
      }
      
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

  /** 切換顯示障礙物 */
  switchObstacle() {
    for (const id of this.obstacleGroup){
      id.isVisible = !id.isVisible;
    }
  }

  /** 切換顯示現有基站 */
  switchDefaultBs() {
    for (const id of this.defaultBsGroup) {
      id.isVisible = !id.isVisible;
    }
  }

  /** 切換顯示新增AP */
  switchCandidate() {
    for (const id of this.candidateGroup){
      id.isVisible = !id.isVisible;
    }
  }

  /** 切換顯示UE */
  switchUe() {
    for (const id of this.ueGroup){
      id.isVisible = !id.isVisible;
    }
  }

  /** 切換顯示heatmap */
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

  /**
   * 訊號覆蓋圖
   * @param zIndex 高度
   */
  genPciMapData(zIndex) {
    const blockCount = this.defaultBs.length + this.result['gaResult'].chosenCandidate.length;
    const colorMap = new Uint8Array(this.width * this.height * 3);
    for (let j = 0; j < this.height; j++) {
        for (let i = 0; i < this.width; i++) {
            const n = (j * this.width + i) * 3;
            if (typeof this.result['gaResult'].connectionMapAll[i][j] === 'undefined') {
              continue;
            }
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

  /**
   * 訊號品質圖
   * @param zIndex 高度
   */
  genSinrMapData(zIndex) {
    const colorMap = new Uint8Array(this.width * this.height * 3);
    const totalDelta = this.result['sinrMax'] - this.result['sinrMin'];
    for (let j = 0; j < this.height; j++) {
        for (let i = 0; i < this.width; i++) {
            const n = (j * this.width + i) * 3;
            if (typeof this.result['gaResult'].sinrMap[i][j] === 'undefined') {
              continue;
            }
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

  /**
   * 訊號強度圖
   * @param zIndex 高度
   */
  genRsrpMapData(zIndex) {
    const colorMap = new Uint8Array(this.width * this.height * 3);
    const totalDelta = this.result['rsrpMax'] - this.result['rsrpMin'];
    for (let j = 0; j < this.height; j++) {
        for (let i = 0; i < this.width; i++) {
            const n = (j * this.width + i) * 3;
            if (typeof this.result['gaResult'].rsrpMap[i][j] === 'undefined') {
              continue;
            }
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

  /**
   * 畫圖
   */
  mounted() {
    console.log('mounted');
    const vm = this;
    this.scene = this.createScene();
    console.log(this.scene);
    this.engine.runRenderLoop(() => {
      vm.scene.render();
      if (this.isPDF) {
        this.img.nativeElement.src = this.canvas.nativeElement.toDataURL();
      }
    });
    window.addEventListener('resize', () => {
        vm.engine.resize();
    });

    if (this.isPDF) {
      this.canvas.nativeElement.style.display = 'none';
    }
  }

  /**
   * closee dialog
   */
  close() {
    this.matDialog.closeAll();
  }

}

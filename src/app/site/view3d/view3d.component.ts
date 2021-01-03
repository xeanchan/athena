import { Component, OnInit, Inject } from '@angular/core';
import { CalculateForm } from '../../form/CalculateForm';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import * as _ from 'lodash';

declare var Plotly: any;

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
      this.obstacleList = data.obstacleList;
      this.defaultBSList = data.defaultBSList;
      this.newBSList = data.newBSList;
      this.ueList = data.ueList;
      this.dragObject = data.dragObject;

      console.log(this.defaultBSList)
    }

  calculateForm: CalculateForm;
  /** 障礙物 */
  obstacleList = [];
  /** 現有基站 */
  defaultBSList = [];
  /** 新增基站 */
  newBSList = [];
  /** 新增ＵＥ */
  ueList = [];
  dragObject = {};

  ngOnInit() {
    this.draw();
  }

  draw() {
    const defaultPlotlyConfiguration = {
      displayModeBar: false
    };

    const layout = {
      autosize: true,
      scene: {
        xaxis: {
          linewidth: 1,
          mirror: 'all',
          range: [0, this.calculateForm.width]
        },
        yaxis: {
          linewidth: 1,
          mirror: 'all',
          range: [0, this.calculateForm.height]
        },
      },
      margin: { t: 0, b: 0, l: 0, r: 0}
    };

    Plotly.newPlot('chart3D', {
      data: this.getTraces(),
      layout: layout,
      config: defaultPlotlyConfiguration
    });
  }

  /**
   * dataURI to blob
   * @param dataURI
   */
  dataURLtoBlob(dataURI) {
    let byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0) {
      byteString = atob(dataURI.split(',')[1]);
    } else {
      byteString = unescape(dataURI.split(',')[1]);
    }
    // separate out the mime component
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    // write the bytes of the string to a typed array
    const ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ia], {type: mimeString});
  }

  /** 3d物件 */
  getTraces() {

    const traces = [];
    const ary = [].concat(this.obstacleList, this.defaultBSList, this.newBSList, this.ueList);
    let obstacleCount = 1;
    let defaultBSCount = 1;
    let newBSCount = 1;
    let ueCount = 1;
    for (const item of ary) {
      let text = '';
      if (this.dragObject[item].type === 'obstacle') {
        text = `障礙物 ${obstacleCount}`;
      } else if (this.dragObject[item].type === 'defaultBS') {
        text = `現有基站 ${defaultBSCount}`;
      } else if (this.dragObject[item].type === 'newBS') {
        text = `新增基站 ${newBSCount}`;
      } else if (this.dragObject[item].type === 'UE') {
        text = `新增ＵＥ ${ueCount}`;
      }
      if (this.dragObject[item].type === 'obstacle') {
        const trace = {
          x: [this.dragObject[item].x, Number(this.dragObject[item].x) + Number(this.dragObject[item].width)],
          y: [this.dragObject[item].y, Number(this.dragObject[item].y) + Number(this.dragObject[item].height)],
          z: [0, this.dragObject[item].altitude],
          mode: 'lines',
          line: {
            color: this.dragObject[item].color,
            opacity: 0.8,
            width: 20
          },
          name: text,
          text: text,
          type: 'scatter3d',
          hoverinfo: 'text+x+y+z'
        };
        traces.push(trace);
        obstacleCount++;
      } else {
        const trace = {
          x: [this.dragObject[item].x],
          y: [this.dragObject[item].y],
          z: [this.dragObject[item].z],
          line: {
            color: this.dragObject[item].color,
            opacity: 0.8
          },
          name: text,
          text: text,
          type: 'scatter3d',
          hoverinfo: 'text+x+y+z'
        };
        traces.push(trace);
        if (this.dragObject[item].type === 'defaultBS') {
          defaultBSCount++;
        } else if (this.dragObject[item].type === 'newBS') {
          newBSCount++;
        } else if (this.dragObject[item].type === 'UE') {
          ueCount++;
        }
      }
    }

    return traces;
  }

  parseType(type) {
    if (type === 'obstacle') {
      return '障礙物';
    } else if (type === 'defaultBS') {
      return '現有基站';
    } else if (type === 'newBS') {
      return '新增基站';
    } else if (type === 'UE') {
      return '新增ＵＥ';
    }
  }

  close() {
    this.matDialog.closeAll();
  }

}

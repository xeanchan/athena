import { Component, OnInit } from '@angular/core';
import { CalculateForm } from '../../form/CalculateForm';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';

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
    private http: HttpClient) {

      this.calculateForm = JSON.parse(window.sessionStorage.getItem('calculateForm'));
      this.obstacleList = JSON.parse(window.sessionStorage.getItem('obstacleList'));
      this.defaultBSList = JSON.parse(window.sessionStorage.getItem('defaultBSList'));
      this.newBSList = JSON.parse(window.sessionStorage.getItem('newBSList'));
      this.ueList = JSON.parse(window.sessionStorage.getItem('ueList'));
      this.dragObject = JSON.parse(window.sessionStorage.getItem('dragObject'));
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
    const reader = new FileReader();
    reader.readAsDataURL(this.dataURLtoBlob(this.calculateForm.mapImage));
    reader.onload = (e) => {
      // draw background image chart
      const defaultPlotlyConfiguration = {
        displaylogo: false,
        showTips: false,
        editable: false,
        scrollZoom: false,
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
        
        margin: { t: 0, b: 60, l: 40},
        // images: [{
        //   source: reader.result,
        //   x: 0,
        //   y: 0,
        //   sizex: this.calculateForm.width,
        //   sizey: this.calculateForm.height,
        //   xref: 'x',
        //   yref: 'y',
        //   xanchor: 'left',
        //   yanchor: 'bottom',
        //   sizing: 'stretch',
        //   hover: 'x+y'
        // }]
      };

      Plotly.newPlot('chart', {
        data: this.getTraces(),
        layout: layout,
        config: defaultPlotlyConfiguration
      });
    };
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

  getTraces() {

    const traces = [];
    for (const item of this.obstacleList) {
      console.log(this.dragObject[item])
      if (this.dragObject[item].element === 'rect') {
        const trace = {
          x: [this.dragObject[item].x, Number(this.dragObject[item].x) + Number(this.dragObject[item].width)],
          y: [this.dragObject[item].y, Number(this.dragObject[item].y) + Number(this.dragObject[item].height)],
          z: [0, this.dragObject[item].altitude],
          mode: 'lines',
          line: {
            color: this.dragObject[item].color,
            opacity: 0.8
          },
          type: 'scatter3d',
        };
        traces.push(trace);
      } else if (this.dragObject[item].element === 'ellipse') {
        const trace = {
          x: [this.dragObject[item].x],
          y: [this.dragObject[item].y],
          z: [this.dragObject[item].altitude],
          // line: {
          //   color: this.dragObject[item].color,
          //   opacity: 0.8,
          //   width: this.dragObject[item].width
          // },
          type: 'scatter3d',
        };
        traces.push(trace);
      }
    }

    return traces;
  }

}

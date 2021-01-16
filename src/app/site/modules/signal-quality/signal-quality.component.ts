import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from '../../../service/auth.service';
import { CalculateForm } from '../../../form/CalculateForm';

declare var Plotly: any;

@Component({
  selector: 'app-signal-quality',
  templateUrl: './signal-quality.component.html',
  styleUrls: ['./signal-quality.component.scss']
})
export class SignalQualityComponent implements OnInit {

  constructor(private authService: AuthService) { }

  // plotLayout;
  calculateForm = new CalculateForm();
  result = {};

  ngOnInit(): void {
  }

  draw(isPDF, zValue) {
    const reader = new FileReader();
    reader.readAsDataURL(this.authService.dataURLtoBlob(this.calculateForm.mapImage));
    reader.onload = (e) => {
      // draw background image chart
      const defaultPlotlyConfiguration = {
        displaylogo: false,
        showTips: false,
        editable: false,
        scrollZoom: false,
        displayModeBar: false
      };

      const images = [];
      const bgImg = {
        source: reader.result,
        x: 0,
        y: 0,
        sizex: this.calculateForm.width,
        sizey: this.calculateForm.height,
        xref: 'x',
        yref: 'y',
        xanchor: 'left',
        yanchor: 'bottom',
        sizing: 'stretch',
        layer: 'below'
      };
      images.push(bgImg);

      const layout = {
        autosize: true,
        xaxis: {
          linewidth: 1,
          mirror: 'all',
          range: [0, this.calculateForm.width],
          showgrid: false,
          zeroline: false,
          fixedrange: true
        },
        yaxis: {
          linewidth: 1,
          mirror: 'all',
          range: [0, this.calculateForm.height],
          showgrid: false,
          zeroline: false,
          fixedrange: true
        },
        margin: { t: 20, b: 20, l: 40},
        images: images
      };

      let id;
      if (isPDF) {
        id = document.querySelector('#pdf_area').querySelector('#quality_chart');
      } else {
        id = document.querySelector('#quality_chart');
      }

      const zLen = this.calculateForm.zValue.split(',').length;
      const zValues = [];
      for (let i = 0; i < zLen; i++) {
        zValues.push([]);
      }
      let xIndex = 0;
      for (const item of this.result['sinrMap']) {
        for (let i = 0; i < zLen; i++) {
          let yIndex = 0;
          for (const yData of item) {
            if (typeof zValues[i][yIndex] === 'undefined') {
              zValues[i][yIndex] = [];
            }
            zValues[i][yIndex][xIndex] = yData[i];
            yIndex++;
          }
        }
        xIndex++;
      }

      const x = [];
      const y = [];
      for (let i = 0; i <= this.result['inputWidth']; i++) {
        x.push(i);
      }
      for (let i = 0; i <= this.result['inputHeight']; i++) {
        y.push(i);
      }
      const traces = [];
      const trace = {
        x: x,
        y: y,
        z: zValues[0],
        type: 'heatmap',
        opacity: 0.8,
        hoverinfo: 'none'
      };
      traces.push(trace);

      // 障礙物
      if (this.calculateForm.obstacleInfo !== '') {
        const obstacle = this.calculateForm.obstacleInfo
        .replace(new RegExp('\\[', 'gi'), '').replace(new RegExp('\\]', 'gi'), '').split('|');
        for (const item of obstacle) {
          const oData = item.split(',');
          const xdata = Number(oData[0]);
          const ydata = Number(oData[1]);
          const width = Number(oData[2]);
          const height = Number(oData[3]);
          let oColor = oData[7];
          const ox = [xdata, xdata + width, xdata + width, xdata, xdata];
          const oy = [ydata, ydata, ydata + height, ydata + height, ydata];
          let text = `障礙物資訊<br>`;
          text += `X: ${xdata}<br>`;
          text += `Y: ${ydata}<br>`;
          text += `長: ${oData[2]}<br>`;
          text += `寬: ${oData[3]}<br>`;
          text += `高度: ${oData[4]}<br>`;
          if (typeof oData[6] !== 'undefined') {
            text += `材質: ${this.authService.parseMaterial(oData[6])}`;
          }
          if (typeof oData[7] === 'undefined') {
            oColor = 'green';
          }
          const oTrace = {
            x: ox,
            y: oy,
            type: 'scatter',
            mode: 'lines',
            line: {
              color: oColor
            },
            fill: 'toself',
            fillcolor: oColor,
            showlegend: false,
            text: text,
            hoverinfo: 'text'
          };
          traces.push(oTrace);
        }
      }
      // 新增基站
      if (this.calculateForm.candidateBs !== '') {
        const list = this.calculateForm.candidateBs
        .replace(new RegExp('\\[', 'gi'), '').replace(new RegExp('\\]', 'gi'), '').split('|');
        const cx = [];
        const cy = [];
        const ctext = [];
        for (const item of list) {
          const oData = item.split(',');
          const xdata = Number(oData[0]);
          const ydata = Number(oData[1]);
          const zdata = Number(oData[2]);
          cx.push(xdata);
          cy.push(ydata);

          let text = `新增基站<br>`;
          text += `X: ${xdata}<br>`;
          text += `Y: ${ydata}<br>`;
          text += `高度: ${zdata}<br>`;
          ctext.push(text);
        }
        const oTrace = {
          x: cx,
          y: cy,
          type: 'scatter',
          mode: 'markers',
          marker: {
            size: 30
          },
          text: ctext,
          hoverinfo: 'text',
          opacity: 0
        };
        traces.push(oTrace);
      }
      console.log(traces);

      Plotly.newPlot(id, {
        data: traces,
        layout: layout,
        config: defaultPlotlyConfiguration
      });
    };
  }

}

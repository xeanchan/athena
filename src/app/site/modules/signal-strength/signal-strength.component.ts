import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from '../../../service/auth.service';
import { CalculateForm } from '../../../form/CalculateForm';

declare var Plotly: any;

@Component({
  selector: 'app-signal-strength',
  templateUrl: './signal-strength.component.html',
  styleUrls: ['./signal-strength.component.scss']
})
export class SignalStrengthComponent implements OnInit {

  constructor(private authService: AuthService) { }

  // plotLayout;
  calculateForm = new CalculateForm();
  result = {};
  rectList = [];
  ellipseList = [];
  polygonList = [];
  candidateList = [];
  defaultBsList = [];
  ueList = [];
  style = {};

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

      this.rectList.length = 0;
      this.ellipseList.length = 0;
      this.polygonList.length = 0;
      this.defaultBsList.length = 0;
      this.candidateList.length = 0;
      this.ueList.length = 0;

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
          fixedrange: true,
          ticks: 'inside',
        },
        yaxis: {
          linewidth: 1,
          mirror: 'all',
          range: [0, this.calculateForm.height],
          showgrid: false,
          zeroline: false,
          fixedrange: true,
          ticks: 'inside',
        },
        margin: { t: 20, b: 20, l: 40},
        images: images
      };

      const zValues = this.calculateForm.zValue.replace('[', '').replace(']', '') .split(',');

      let id;
      if (isPDF) {
        id = document.querySelector('#pdf_area').querySelectorAll(`.signal_strength`)[zValues.indexOf(zValue)];
      } else {
        id = document.querySelectorAll(`.signal_strength`)[0];
      }

      const zLen = this.calculateForm.zValue.split(',').length;
      const zData = [];
      for (let i = 0; i < zLen; i++) {
        zData.push([]);
      }
      let xIndex = 0;
      for (const item of this.result['rsrpMap']) {
        for (let i = 0; i < zLen; i++) {
          let yIndex = 0;
          for (const yData of item) {
            if (typeof zData[i][yIndex] === 'undefined') {
              zData[i][yIndex] = [];
            }
            zData[i][yIndex][xIndex] = yData[i];
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
        z: zData[zValues.indexOf(zValue)],
        type: 'heatmap'
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
          let oColor = oData[7];
          let text = `障礙物資訊
          X: ${xdata}
          Y: ${ydata}
          長: ${oData[2]}
          寬: ${oData[3]}
          高度: ${oData[4]}
          `;
          if (typeof oData[6] !== 'undefined') {
            text += `材質: ${this.authService.parseMaterial(oData[6])}`;
          }
          if (typeof oData[7] === 'undefined') {
            oColor = 'green';
          }
          this.rectList.push({
            x: xdata,
            y: ydata,
            style: {
              left: 0,
              bottom: 0,
              width: oData[2],
              height: oData[3],
              position: 'absolute'
            },
            svgStyle: {
              width: oData[2],
              height: oData[3],
              fill: oColor,
            },
            hover: text
          });

        }
      }

      // 現有基站
      if (this.calculateForm.defaultBs !== '') {
        const list = this.calculateForm.defaultBs
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

          const text = `新增基站
          X: ${xdata}
          Y: ${ydata}
          高度: ${zdata}`;
          ctext.push(text);
          this.defaultBsList.push({
            x: xdata,
            y: ydata,
            color: 'green',
            hover: text
          });

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

          const text = `新增基站
          X: ${xdata}
          Y: ${ydata}
          高度: ${zdata}`;
          ctext.push(text);
          this.candidateList.push({
            x: xdata,
            y: ydata,
            color: 'green',
            hover: text
          });

        }
      }

      // UE
      if (this.calculateForm.ueCoordinate !== '') {
        const list = this.calculateForm.ueCoordinate
        .replace(new RegExp('\\[', 'gi'), '').replace(new RegExp('\\]', 'gi'), '').split('|');

        for (const item of list) {
          const oData = item.split(',');
          const xdata = oData[0];
          const ydata = oData[1];
          const zdata = oData[2];
          if (zdata !== zValue) {
            continue;
          }

          const text = `新增ＵＥ
          X: ${xdata}
          Y: ${ydata}
          高度: ${zdata}`;
          this.ueList.push({
            x: xdata,
            y: ydata,
            color: 'green',
            hover: text
          });

        }
      }
      console.log(traces);

      Plotly.newPlot(id, {
        data: traces,
        layout: layout,
        config: defaultPlotlyConfiguration
      }).then((gd) => {
        const xy: SVGRectElement = gd.querySelector('.xy').querySelectorAll('rect')[0];
        const rect = xy.getBoundingClientRect();
        const image = new Image();
        image.src = reader.result.toString();
        image.onload = () => {
          const height = (image.height / (image.width * 0.9)) * rect.width;

          Plotly.relayout(id, {
            height: height
          }).then((gd2) => {
            const xy2: SVGRectElement = gd2.querySelector('.xy').querySelectorAll('rect')[0];
            const rect2 = xy2.getBoundingClientRect();
            gd2.style.opacity = 0.85;
            gd2.querySelectorAll('.plotly')[0].style.opacity = 0.85;

            this.style = {
              left: `${xy2.getAttribute('x')}px`,
              top: `${xy2.getAttribute('y')}px`,
              width: `${rect2.width}px`,
              height: `${rect2.height}px`,
              position: 'absolute'
            };

            const pixelXLinear = Plotly.d3.scale.linear()
              .domain([0, this.calculateForm.width])
              .range([0, rect2.width]);

            const pixelYLinear = Plotly.d3.scale.linear()
              .domain([0, this.calculateForm.height])
              .range([0, rect2.height]);

            for (const item of this.rectList) {
              item['style'].left = `${pixelXLinear(item.x)}px`;
              item['style'].bottom = `${pixelYLinear(item.y)}px`;
              item['style'].width = `${pixelXLinear(item['svgStyle'].width)}px`;
              item['style'].height = `${pixelYLinear(item['svgStyle'].height)}px`;
              item['svgStyle'].width = `${pixelXLinear(item['svgStyle'].width)}px`;
              item['svgStyle'].height = `${pixelYLinear(item['svgStyle'].height)}px`;
            }

            for (const item of this.defaultBsList) {
              item['style'] = {
                left: `${pixelXLinear(item.x)}px`,
                bottom: `${pixelYLinear(item.y)}px`,
                position: 'absolute'
              };
              item['circleStyle'] = {
                left: `${pixelXLinear(item.x) + 15}px`,
                bottom: `${pixelYLinear(item.y) + 25}px`,
                position: 'absolute'
              };
            }

            for (const item of this.candidateList) {
              item['style'] = {
                left: `${pixelXLinear(item.x)}px`,
                bottom: `${pixelYLinear(item.y)}px`,
                position: 'absolute'
              };
              item['circleStyle'] = {
                left: `${pixelXLinear(item.x) + 15}px`,
                bottom: `${pixelYLinear(item.y) + 25}px`,
                position: 'absolute'
              };
            }

            for (const item of this.ueList) {
              item['style'] = {
                left: `${pixelXLinear(item.x)}px`,
                bottom: `${pixelYLinear(item.y)}px`,
                position: 'absolute'
              };
              item['circleStyle'] = {
                left: `${pixelXLinear(item.x) + 15}px`,
                bottom: `${pixelYLinear(item.y) + 25}px`,
                position: 'absolute'
              };
            }
          });
        };


      });
    };
  }

}

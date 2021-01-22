import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from '../../../service/auth.service';
import { CalculateForm } from '../../../form/CalculateForm';

declare var Plotly: any;

@Component({
  selector: 'app-signal-cover',
  templateUrl: './signal-cover.component.html',
  styleUrls: ['./signal-cover.component.scss']
})
export class SignalCoverComponent implements OnInit {

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
        id = document.querySelector('#pdf_area').querySelectorAll(`.signal_cover`)[zValues.indexOf(zValue)];
      } else {
        id = document.querySelectorAll(`.signal_cover`)[0];
      }

      const zLen = this.calculateForm.zValue.split(',').length;
      const zData = [];
      for (let i = 0; i < zLen; i++) {
        zData.push([]);
      }
      let xIndex = 0;
      for (const item of this.result['connectionMapAll']) {
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
      // 現有基站
      if (this.calculateForm.defaultBs !== '') {
        const list = this.calculateForm.defaultBs
        .replace(new RegExp('\\[', 'gi'), '').replace(new RegExp('\\]', 'gi'), '').split('|');
        const cx = [];
        const cy = [];
        const ctext = [];
        for (const item of list) {
          const oData = item.split(',');
          cx.push(oData[0]);
          cy.push(oData[1]);
          ctext.push(`現有基站<br>X: ${oData[0]}<br>Y: ${oData[1]}<br>高度: ${oData[2]}`);
        }
        traces.push({
          x: cx,
          y: cy,
          text: ctext,
          marker: {
            color: '#338aee',
          },
          type: 'scatter',
          mode: 'markers',
          hoverinfo: 'none',
          showlegend: false,
        });
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
          cx.push(oData[0]);
          cy.push(oData[1]);
          ctext.push(`新增基站<br>X: ${oData[0]}<br>Y: ${oData[1]}<br>高度: ${oData[2]}`);
        }
        traces.push({
          x: cx,
          y: cy,
          text: ctext,
          marker: {
            color: '#f7176a',
          },
          type: 'scatter',
          mode: 'markers',
          hoverinfo: 'none',
          showlegend: false,
        });
      }

      // UE
      if (this.calculateForm.ueCoordinate !== '') {
        const list = this.calculateForm.ueCoordinate
        .replace(new RegExp('\\[', 'gi'), '').replace(new RegExp('\\]', 'gi'), '').split('|');
        const cx = [];
        const cy = [];
        const text = [];
        for (const item of list) {
          const oData = item.split(',');
          if (oData[2] !== zValue) {
            continue;
          }
          cx.push(oData[0]);
          cy.push(oData[1]);
          text.push(`新增ＵＥ<br>X: ${oData[0]}<br>Y: ${oData[1]}<br>高度: ${oData[2]}`);
        }

        traces.push({
          x: cx,
          y: cy,
          text: text,
          marker: {
            color: 'green',
          },
          type: 'scatter',
          mode: 'markers',
          hoverinfo: 'none',
          showlegend: false
        });
      }

      const trace = {
        x: x,
        y: y,
        z: zData[zValues.indexOf(zValue)],
        colorscale: [
          ['0.0', 'rgb(12,51,131)'],
          ['0.25', 'rgb(10,136,186)'],
          ['0.5', 'rgb(242,211,56)'],
          ['0.75', 'rgb(242,143,56)'],
          ['1', 'rgb(217,30,30)'],
        ],
        type: 'heatmap',
        hoverinfo: 'x+y+z'
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

          });
        };

      });
    };
  }

}

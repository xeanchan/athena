import { Component, OnInit, Input, HostListener } from '@angular/core';
import { AuthService } from '../../../service/auth.service';
import { CalculateForm } from '../../../form/CalculateForm';
import { TranslateService } from '@ngx-translate/core';

declare var Plotly: any;

@Component({
  selector: 'app-signal-strength',
  templateUrl: './signal-strength.component.html',
  styleUrls: ['./signal-strength.component.scss']
})
export class SignalStrengthComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private translateService: TranslateService
  ) { }

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
  colorBars = [];
  imgSRC;
  chartId;
  showUE = true;

  @HostListener('window:resize') windowResize() {
    Plotly.relayout(this.chartId, {
      autosize: true
    });
  }

  ngOnInit(): void {
  }

  draw(isPDF, zValue) {
    zValue = Number(zValue);
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
        images: images,
        hovermode: 'closest'
      };

      const zValues = JSON.parse(this.calculateForm.zValue);

      let id;
      if (isPDF) {
        id = document.querySelector('#pdf_area').querySelectorAll(`.signal_strength`)[zValues.indexOf(zValue)];
      } else {
        id = document.querySelectorAll(`.signal_strength`)[0];
      }
      this.chartId = id;

      const zLen = zValues.length;
      const zData = [];
      const allZ = [];
      const zText = [];
      for (let i = 0; i < zLen; i++) {
        zData.push([]);
        allZ.push([]);
        zText.push([]);
      }
      let xIndex = 0;
      for (const item of this.result['rsrpMap']) {
        for (let i = 0; i < zLen; i++) {
          let yIndex = 0;
          for (const yData of item) {
            if (typeof zData[i][yIndex] === 'undefined') {
              zData[i][yIndex] = [];
              zText[i][yIndex] = [];
            }
            zData[i][yIndex][xIndex] = yData[i];
            zText[i][yIndex][xIndex] = Math.round(yData[i] * 100) / 100;
            yIndex++;
            allZ[i].push(yData[i]);
          }
        }
        xIndex++;
      }

      // 取z的最大值
      const zMax = [];
      const zMin = [];
      for (const item of allZ) {
        zMax.push(Plotly.d3.max(item));
        zMin.push(Plotly.d3.min(item));
      }

      // 套件的colorbar在pdf會空白，另外產生
      this.colorBars.length = 0;
      this.colorBars.push(
        {
          val: -44,
          background: 'rgb(217,30,30)',
          height: '25%'
        },
        {
          val: -70,
          background: 'linear-gradient(rgb(217,30,30), rgb(242,143,56))',
          height: '25%'
        },
        {
          val: -95,
          background: 'linear-gradient(rgb(242,143,56), rgb(242,211,56))',
          height: '25%'
        },
        {
          val: -120,
          background: 'linear-gradient(rgb(242,211,56), rgb(10,136,186))',
          height: '25%'
        },
        {
          val: -140,
          background: 'linear-gradient(rgb(10,136,186), rgb(12,51,131))',
          height: '25%'
        }
      );

      const x = [];
      const y = [];

      for (let i = 0; i <= this.result['inputWidth']; i++) {
        x.push(i);
      }
      for (let i = 0; i <= this.result['inputHeight']; i++) {
        y.push(i);
      }
      const traces = [];
      // UE
      if (this.calculateForm.ueCoordinate !== '') {
        const list = this.calculateForm.ueCoordinate.split('|');
        const cx = [];
        const cy = [];
        const text = [];
        for (const item of list) {
          const oData = JSON.parse(item);
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
            color: '#140101',
          },
          type: 'scatter',
          mode: 'markers',
          hoverinfo: 'none',
          opacity: 0.7,
          showlegend: false,
          visible: this.showUE
        });
      }

      const trace = {
        x: x,
        y: y,
        z: zData[zValues.indexOf(zValue)],
        text: zText[zValues.indexOf(zValue)],
        colorbar: {
          tickmode: 'array',
          tickvals: [-44, -60, -80, -100, -120, -140],
          ticktext: [-44, -60, -80, -100, -120, -140]
        },
        colorscale: [
          ['0.0', 'rgb(12,51,131)'],
          ['0.25', 'rgb(10,136,186)'],
          ['0.5', 'rgb(242,211,56)'],
          ['0.75', 'rgb(242,143,56)'],
          ['1', 'rgb(217,30,30)'],
        ],
        type: 'heatmap',
        hovertemplate: `X: %{x}<br>Y: %{y}<br>${this.translateService.instant('signalStrength')}: %{text}<extra></extra>`,
        showscale: false,
        zmax: -44,
        zmin: -140
      };
      traces.push(trace);

      // 障礙物
      if (this.calculateForm.obstacleInfo !== '') {
        const obstacle = this.calculateForm.obstacleInfo.split('|');
        for (const item of obstacle) {
          const oData = JSON.parse(item);
          const xdata = oData[0];
          const ydata = oData[1];
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
            oColor = '#000000';
          }
          this.rectList.push({
            x: xdata,
            y: ydata,
            style: {
              left: 0,
              bottom: 0,
              width: oData[2],
              height: oData[3],
              transform: `rotate(${oData[5]}deg)`,
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
        const list = this.calculateForm.defaultBs.split('|');
        const cx = [];
        const cy = [];
        const ctext = [];
        for (const item of list) {
          const oData = JSON.parse(item);
          const xdata = oData[0];
          const ydata = oData[1];
          const zdata = oData[2];
          cx.push(xdata);
          cy.push(ydata);

          const text = `現有基站
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
        const list = this.calculateForm.candidateBs.split('|');
        const cx = [];
        const cy = [];
        const chosenCandidate = [];
        for (let i = 0; i < this.result['chosenCandidate'].length; i++) {
          chosenCandidate.push(this.result['chosenCandidate'][i].toString());
        }
        let num = 1;
        for (const item of list) {
          const oData = JSON.parse(item);
          if (chosenCandidate.includes(oData.toString())) {
            const xdata = oData[0];
            const ydata = oData[1];
            const zdata = oData[2];
            cx.push(xdata);
            cy.push(ydata);

            const text = `${this.translateService.instant('candidateBs')}
            X: ${xdata}
            Y: ${ydata}
            Z: ${zdata}
            ${this.translateService.instant('bsPower')}: ${this.result['candidateBsPower'][chosenCandidate.indexOf(oData.toString())]} dBm`;
            this.candidateList.push({
              x: xdata,
              y: ydata,
              color: '#f7176a',
              hover: text,
              num: num
            });
          }
          num++;
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
          let layoutOption;
          if (image.width > image.height) {
            const height = (image.height / (image.width * 0.9)) * rect.width;
            layoutOption = {
              height: height
            };
          } else {
            const width = (image.width / (image.height * 0.9)) * rect.height;
            layoutOption = {
              width: width
            };
          }

          Plotly.relayout(id, layoutOption).then((gd2) => {
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
              // 障礙物加粗
              let width = pixelXLinear(item['svgStyle'].width);
              if (width < 5) {
                width = 5;
              }
              let height = pixelXLinear(item['svgStyle'].height);
              if (height < 5) {
                height = 5;
              }
              item['style'].left = `${pixelXLinear(item.x)}px`;
              item['style'].bottom = `${pixelYLinear(item.y)}px`;
              item['style'].width = `${width}px`;
              item['style'].height = `${height}px`;
              item['svgStyle'].width = `${width}px`;
              item['svgStyle'].height = `${height}px`;
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

            // 新增基站
            const xy3: SVGRectElement = gd2.querySelector('.xy');
            const rect3 = xy3.getBoundingClientRect();
            const candisateXLinear = Plotly.d3.scale.linear()
              .domain([0, this.calculateForm.width])
              .range([0, rect3.width]);

            const candisateYLinear = Plotly.d3.scale.linear()
              .domain([0, this.calculateForm.height])
              .range([0, rect3.height]);
            for (const item of this.candidateList) {
              item['style'] = {
                left: `${candisateXLinear(item.x)}px`,
                bottom: `${candisateYLinear(item.y)}px`,
                position: 'absolute'
              };
              item['circleStyle'] = {
                left: `${candisateXLinear(item.x) + 15}px`,
                bottom: `${candisateYLinear(item.y) + 25}px`,
                position: 'absolute'
              };
            }

          });
        };


      });
    };
  }

  /** show/hide UE */
  switchUE(visible) {
    Plotly.restyle(this.chartId, {
      visible: visible
    }, [0]);
  }

}

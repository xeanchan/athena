import { Component, OnInit, Input, HostListener, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { AuthService } from '../../../service/auth.service';
import { CalculateForm } from '../../../form/CalculateForm';
import { TranslateService } from '@ngx-translate/core';
import { Options } from '@angular-slider/ngx-slider';

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
  divStyle = {
    position: 'relative',
    opacity: 0
  };
  zValue = '';
  // 障礙物顯示style
  showObstacle = 'visible';
  // AP顯示style
  showCandidate = true;
  // slide
  opacityValue: number = 0.8;
  shapes = [];
  annotations = [];

  @ViewChildren('obstacletElm') obstacleElm: QueryList<ElementRef>;

  @HostListener('window:resize') windowResize() {
    Plotly.relayout(this.chartId, {
      autosize: true
    });
  }

  ngOnInit(): void {
  }

  draw(isPDF, zValue) {
    zValue = Number(zValue);
    this.zValue = zValue;
    const images = [];
    if (!this.authService.isEmpty(this.calculateForm.mapImage)) {
      const reader = new FileReader();
      reader.readAsDataURL(this.authService.dataURLtoBlob(this.calculateForm.mapImage));
      reader.onload = (e) => {
        // background image
        images.push({
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
        });

        this.drawChart(isPDF, images);
      };
    } else {
      this.drawChart(isPDF, images);
    }
  }

  drawChart(isPDF, images) {
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
        ticksuffix: 'm'
      },
      yaxis: {
        linewidth: 1,
        mirror: 'all',
        range: [0, this.calculateForm.height],
        showgrid: false,
        zeroline: false,
        fixedrange: true,
        ticks: 'inside',
        ticksuffix: 'm'
      },
      margin: { t: 20, b: 20, l: 40},
      images: images,
      hovermode: 'closest'
    };

    const zValues = JSON.parse(this.calculateForm.zValue);

    let id;
    if (isPDF) {
      id = document.querySelector('#pdf_area').querySelectorAll(`.signal_strength`)[zValues.indexOf(this.zValue)];
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
    const wRatio = this.calculateForm.width / this.result['rsrpMap'].length;
    let xval = 0;
    const xLen = this.result['rsrpMap'].length;
    for (let i = 0; i <= xLen; i++) {
      x.push(xval);
      xval += wRatio;
    }
    const hRatio = this.calculateForm.height / this.result['rsrpMap'][0].length;
    let yval = 0;
    const yLen = this.result['rsrpMap'][0].length;
    for (let i = 0; i <= yLen; i++) {
      y.push(yval);
      yval += hRatio;
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
        if (oData[2] !== this.zValue) {
          continue;
        }
        cx.push(oData[0]);
        cy.push(oData[1]);
        text.push(`${this.translateService.instant('ue')}<br>X: ${oData[0]}<br>Y: ${oData[1]}<br>${this.translateService.instant('altitude')}: ${oData[2]}`);
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
      z: zData[zValues.indexOf(this.zValue)],
      text: zText[zValues.indexOf(this.zValue)],
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
      zmin: -140,
      zsmooth: 'best',
      opacity: this.opacityValue
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
        let text = `${this.translateService.instant('planning.obstacleInfo')}
        X: ${xdata}
        Y: ${ydata}
        ${this.translateService.instant('width')}: ${oData[2]}
        ${this.translateService.instant('height')}: ${oData[3]}
        ${this.translateService.instant('altitude')}: ${oData[4]}
        `;
        if (typeof oData[6] !== 'undefined') {
          text += `${this.translateService.instant('material')}: ${this.authService.parseMaterial(oData[6])}`;
        }
        if (typeof oData[7] === 'undefined') {
          oColor = '#000000';
        }
        const rotate = oData[5];
        this.rectList.push({
          x: xdata,
          y: ydata,
          rotate: rotate,
          style: {
            left: 0,
            top: 0,
            width: oData[2],
            height: oData[3],
            transform: `rotate(${rotate}deg)`,
            position: 'absolute',
            visibility: this.showObstacle,
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

        const text = `${this.translateService.instant('defaultBs')}
        X: ${xdata}
        Y: ${ydata}
        ${this.translateService.instant('altitude')}: ${zdata}`;
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
      const candidateX = [];
      const candidateY = [];
      const candidateText = [];
      const hoverText = [];
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
            num: num,
            ap: `AP ${num}`
          });

          candidateX.push(xdata);
          candidateY.push(ydata);
          candidateText.push(`Z: ${zdata}<br>${this.translateService.instant('bsPower')}: ${this.result['candidateBsPower'][chosenCandidate.indexOf(oData.toString())]} dBm`);
          hoverText.push(text);
        }
        num++;
      }

      traces.push({
        x: candidateX,
        y: candidateY,
        text: candidateText,
        textfont: {
          color: '#fff'
        },
        type: 'scatter',
        mode: 'markers',
        marker: {
          size: 25,
          color: '#000'
        },
        hovertemplate: `X: %{x}<br>Y: %{y}<br>%{text}<extra></extra>`,
        showlegend: false,
        visible: this.showCandidate,
        uid: `AP`,
        opacity: 0
      });
    }

    console.log(traces);

    Plotly.newPlot(id, {
      data: traces,
      layout: layout,
      config: defaultPlotlyConfiguration
    }).then((gd) => {
      const xy: SVGRectElement = gd.querySelector('.xy').querySelectorAll('rect')[0];
      const rect = xy.getBoundingClientRect();
      let layoutOption = {};
      this.shapes.length = 0;
      this.annotations.length = 0;
      // 新增基站
      if (this.calculateForm.candidateBs !== '') {
        const xLinear = Plotly.d3.scale.linear()
        .domain([0, rect.width])
        .range([0, this.calculateForm.width]);

        const yLinear = Plotly.d3.scale.linear()
          .domain([0, rect.height])
          .range([0, this.calculateForm.height]);

        
        for (const item of this.candidateList) {
          this.shapes.push({
            type: 'rect',
            xref: 'x',
            yref: 'y',
            x0: item.x,
            y0: item.y,
            x1: item.x + Number(xLinear(25)),
            y1: item.y + Number(yLinear(18)),
            fillcolor: '#000',
            visible: this.showCandidate
          });

          this.annotations.push({
            x: item.x + Number(xLinear(12.5)),
            y: item.y + Number(yLinear(9)),
            xref: 'x',
            yref: 'y',
            text: item.ap,
            showarrow: false,
            font: {
              color: '#fff',
              size: 10
            },
            visible: this.showCandidate
          });
        }
      }

      if (images.length > 0) {
        const image = new Image();
        image.src = images[0].source;
        image.onload = () => {
          // const maxHeight = window.innerHeight - 170;
          // let imgHeight = image.height;
          // if (imgHeight > maxHeight) {
          //   imgHeight = maxHeight;
          // }
          // if (image.width > imgHeight) {
          //   const height = (imgHeight / (image.width * 0.9)) * rect.width;
          //   layoutOption = {
          //     height: height
          //   };
          // } else {
          //   const width = (image.width / (imgHeight * 0.9)) * rect.height;
          //   layoutOption = {
          //     width: width
          //   };
          // }
          const main = gd.getBoundingClientRect();
          const imgWidth = (main.width / image.width) * image.width;
          const imgHeight = (main.height / image.height) * image.height;
          layoutOption = {
            width: imgWidth,
            height: imgHeight
          };

          layoutOption['shapes'] = this.shapes;
          layoutOption['annotations'] = this.annotations;
          this.reLayout(id, layoutOption);
        };
        
      } else {
        layoutOption['shapes'] = this.shapes;
        layoutOption['annotations'] = this.annotations;
        this.reLayout(id, layoutOption);
      }
    });
  }

  reLayout(id, layoutOption) {
    Plotly.relayout(id, layoutOption).then((gd2) => {
      this.divStyle.opacity = 1;
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

      const ary = [];
      let i = 0;
      for (const item of this.rectList) {
        // 障礙物加粗
        let width = pixelXLinear(item['svgStyle'].width);
        if (width < 5) {
          width = 5;
        }
        let height = pixelYLinear(item['svgStyle'].height);
        if (height < 5) {
          height = 5;
        }

        item['style'].top = `${rect2.height - height - pixelYLinear(item.y)}px`;
        item['style'].left = `${pixelXLinear(item.x)}px`;
        item['style'].width = `${width}px`;
        item['style'].height = `${height}px`;
        item['svgStyle'].width = `${width}px`;
        item['svgStyle'].height = `${height}px`;
        
        if (item.rotate < 0) {
          ary.push({
            obj: item,
            index: i
          });
        }
        
        i++;
      }

      // fixed斜障礙物position
      window.setTimeout(() => {
        for (let k = 0; k < ary.length; k++) {
          const obj = this.obstacleElm.toArray()[ary[k].index].nativeElement.getBoundingClientRect();
          ary[k].obj['style'].left = `${Number(ary[k].obj['style'].left.replace('px', '')) + ((obj.right - obj.left) / 2)}px`;
        }
      }, 0);

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
          position: 'absolute',
          visibility: this.showCandidate
        };
        item['circleStyle'] = {
          left: `${candisateXLinear(item.x) + 15}px`,
          bottom: `${candisateYLinear(item.y) + 25}px`,
          position: 'absolute',
          visibility: this.showCandidate
        };
      }

    });
  }

  /** show/hide UE */
  switchUE(visible) {
    Plotly.restyle(this.chartId, {
      visible: visible
    }, [0]);
  }

  /** show/hide 障礙物 */
  switchShowObstacle(visible) {
    for (const item of this.rectList) {
      item.style['visibility'] = visible;
    }
  }

  /** show/hide AP */
  switchShowCandidate(visible) {
    // for (const item of this.candidateList) {
    //   item.style['visibility'] = visible;
    //   item.circleStyle['visibility'] = visible;
    // }
    Plotly.restyle(this.chartId, {
      visible: visible
    }, [2]);

    for (const item of this.shapes) {
      item.visible = visible;
    }
    for (const item of this.annotations) {
      item.visible = visible;
    }

    Plotly.relayout(this.chartId, {
      shapes: this.shapes,
      annotations: this.annotations
    });
  }

  /** heatmap透明度 */
  changeOpacity() {
    const chartElm = document.querySelectorAll(`.signal_strength`)[0];
    let traceNum = 1;
    if (this.authService.isEmpty(this.calculateForm.ueCoordinate)) {
      traceNum = 0;
    }
    Plotly.restyle(chartElm, {
      opacity: this.opacityValue
    }, [traceNum]);
  }

}

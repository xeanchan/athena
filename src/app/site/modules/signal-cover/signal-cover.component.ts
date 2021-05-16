import { Component, OnInit, Input, HostListener, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { AuthService } from '../../../service/auth.service';
import { CalculateForm } from '../../../form/CalculateForm';
import { TranslateService } from '@ngx-translate/core';
import { Options } from '@angular-slider/ngx-slider';

declare var Plotly: any;

/**
 * 訊號覆蓋圖
 */
@Component({
  selector: 'app-signal-cover',
  templateUrl: './signal-cover.component.html',
  styleUrls: ['./signal-cover.component.scss']
})
export class SignalCoverComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private translateService: TranslateService
  ) { }

  /** 結果form */
  calculateForm = new CalculateForm();
  /** 結果data */
  result = {};
  /** 障礙物list */
  rectList = [];
  /** AP list */
  candidateList = [];
  /** 現有基站 list */
  defaultBsList = [];
  /** UE list */
  ueList = [];
  /** 外框style */
  style = {};
  /** 圖id */
  chartId;
  /** show UE */
  showUE = true;
  /** 圖區style */
  divStyle = {
    position: 'relative',
    opacity: 0
  };
  /** 高度 */
  zValue = '1';
  /** 障礙物顯示 */
  showObstacle = 'visible';
  /** AP顯示 */
  showCandidate = true;
  /** slide */
  opacityValue: number = 0.8;
  /** AP */
  shapes = [];
  /** AP文字 */
  annotations = [];
  /** 障礙物element */
  @ViewChildren('obstaclecElm') obstacleElm: QueryList<ElementRef>;

  @HostListener('window:resize') windowResize() {
    Plotly.relayout(this.chartId, {
      autosize: true
    });
  }

  ngOnInit(): void {
  }

  /**
   * 畫圖
   * @param isPDF 
   * @param zValue 
   */
  draw(isPDF, zValue) {
    this.zValue = zValue;
    const images = [];
    if (!this.authService.isEmpty(this.calculateForm.mapImage)) {
      const reader = new FileReader();
      reader.readAsDataURL(this.authService.dataURLtoBlob(this.calculateForm.mapImage));
      reader.onload = (e) => {
        // background image
        images.push({
          source: reader.result.toString(),
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

  /**
   * 畫圖
   * @param isPDF 
   * @param images 
   */
  drawChart(isPDF, images) {
    const defaultPlotlyConfiguration = {
      displaylogo: false,
      showTips: false,
      editable: false,
      scrollZoom: false,
      displayModeBar: false
    };

    this.rectList.length = 0;
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
      margin: { t: 20, b: 20, l: 40, r: 5},
      images: images,
      hovermode: 'closest'
    };

    const zValues = JSON.parse(this.calculateForm.zValue.toString());

    let id;
    if (isPDF) {
      id = document.querySelector('#pdf_area').querySelectorAll(`.signal_cover`)[zValues.indexOf(Number(this.zValue))];
    } else {
      id = document.querySelectorAll(`.signal_cover`)[0];
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
    for (const item of this.result['connectionMapAll']) {
      for (let i = 0; i < zLen; i++) {
        let yIndex = 0;
        for (const yData of item) {
          if (typeof zData[i][yIndex] === 'undefined') {
            zData[i][yIndex] = [];
            zText[i][yIndex] = [];
          }
          zData[i][yIndex][xIndex] = yData[i];
          if (yData[i] == null) {
            console.log(`x:${xIndex}, y:${yIndex}, z:${i}, ${yData[i]}`);
            console.log(item);
          }
          
          zText[i][yIndex][xIndex] = `AP ${(Math.round(yData[i] * 100) / 100)}`;
          yIndex++;
          allZ[i].push(yData[i]);
        }
      }
      xIndex++;
    }
    // 取z的最大值
    const zMax = [];
    for (const item of allZ) {
      zMax.push(Plotly.d3.max(item));
    }

    const x = [];
    const y = [];
    const wRatio = this.calculateForm.width / this.result['connectionMapAll'].length;
    let xval = 0;
    const xLen = this.result['connectionMapAll'].length;
    for (let i = 0; i <= xLen; i++) {
      x.push(xval);
      xval += wRatio;
    }
    const hRatio = this.calculateForm.height / this.result['connectionMapAll'][0].length;
    let yval = 0;
    const yLen = this.result['connectionMapAll'][0].length;
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
        showlegend: false,
        visible: this.showUE
      });
    }

    // 圖區右邊建議基站
    if (this.calculateForm.candidateBs !== '') {
      const list = this.calculateForm.candidateBs.split('|');
      const cx = [];
      const cy = [];
      let k = 1;

      const chosenCandidate = [];
      for (let i = 0; i < this.result['chosenCandidate'].length; i++) {
        chosenCandidate.push(this.result['chosenCandidate'][i].toString());
      }

      const apMap = {};
      for (let i = 0; i < list.length; i++) {
        const oData = JSON.parse(list[i]);
        if (chosenCandidate.includes(oData.toString())) {
          cx.push(oData[0]);
          cy.push(oData[1]);

          const z = zData[zValues.indexOf(Number(this.zValue))][Math.ceil(oData[1])][Math.ceil(oData[0])];
          const max = zMax[zValues.indexOf(Number(this.zValue))];

          let color;
          if (z < max * 0.25) {
            color = 'rgb(12,51,131)';
          } else if (z >= max * 0.25 && z < max * 0.5) {
            color = 'rgb(10,136,186)';
          } else if (z >= max * 0.5 && z < max * 0.75) {
            color = 'rgb(242,211,56)';
          } else if (z >= max * 0.75 && z < max) {
            color = 'rgb(242,143,56)';
          } else if (z === max) {
            color = 'rgb(217,30,30)';
          }

          traces.push({
            x: [0],
            y: [0],
            name: `AP ${k}`,
            marker: {
              color: color,
            },
            type: 'bar',
            hoverinfo: 'none',
            showlegend: true
          });

          apMap[z] = `AP ${k}`;
        }
        k++;
      }
      // 重新指定連線對象tooltip
      xIndex = 0;
      for (const item of this.result['connectionMapAll']) {
        for (let i = 0; i < zLen; i++) {
          let yIndex = 0;
          for (const yData of item) {
            zText[i][yIndex][xIndex] = apMap[yData[i]];
            yIndex++;
          }
        }
        xIndex++;
      }
    }

    const trace = {
      x: x,
      y: y,
      z: zData[zValues.indexOf(Number(this.zValue))],
      text: zText[zValues.indexOf(this.zValue)],
      colorscale: [
        ['0.0', 'rgb(12,51,131)'],
        ['0.25', 'rgb(10,136,186)'],
        ['0.5', 'rgb(242,211,56)'],
        ['0.75', 'rgb(242,143,56)'],
        ['1', 'rgb(217,30,30)'],
      ],
      type: 'heatmap',
      hovertemplate: `X: %{x}<br>Y: %{y}<br>${this.translateService.instant('ap.num')}: %{text}<extra></extra>`,
      showscale: false,
      zsmooth: 'best',
      opacity: this.opacityValue
    };
    traces.push(trace);
    console.log(traces);

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

    // 障礙物
    if (this.calculateForm.obstacleInfo !== '') {
      const obstacle = this.calculateForm.obstacleInfo.split('|');
      for (const item of obstacle) {
        const oData = JSON.parse(item);
        const xdata = oData[0];
        const ydata = oData[1];
        const oColor = '#000000';
        // 0~3分別是矩型、三角形、圓形、梯形
        let shape = oData[7];
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
          shape = '0';
        }
        const rotate = oData[5];
        this.rectList.push({
          x: xdata,
          y: ydata,
          rotate: rotate,
          shape: shape,
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
            x1: item.x + Number(xLinear(30)),
            y1: item.y + Number(yLinear(18)),
            fillcolor: '#000',
            visible: this.showCandidate
          });

          this.annotations.push({
            x: item.x + Number(xLinear(15)),
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
          console.log(`img width: ${image.width}, img height: ${image.height}`);
          console.log(`gd width: ${main.width}, gd height: ${main.height}`);
          let imgWidth = image.width;
          let imgHeight = image.height;
          if (imgWidth >= main.width) {
            for (let i = 0.99; i >= 0; i -= 0.01) {
              imgHeight = image.height * i;
              imgWidth = image.width * i;
              if (imgWidth <= main.width) {
                break;
              }
            }
          } else {
            const maxMain = main.width;
            for (let i = 1.01; i < 2; i += 0.01) {
              imgHeight = image.height * i;
              imgWidth = image.width * i;
              if (imgWidth >= maxMain) {
                break;
              }
            }
          }
          console.log(`width: ${imgWidth}, height: ${imgHeight}`);
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

  /**
   * 畫好圖後重新計算比例尺
   * @param id 
   * @param layoutOption 
   */
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
        if (item.shape === 1) {
          const points = `${width / 2},0 ${width}, ${height} 0, ${height}`;
          item['points'] = points;
          console.log(item);
        } else if (item.shape === 2) {
          item['ellipseStyle'] = {
            cx: width / 2,
            cy: height / 2,
            rx: width / 2,
            ry: height / 2
          };
        }
        
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

  /** 亂數顏色 */
  getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  /**
   * show/hide UE
   * @param visible 
   */
  switchUE(visible) {
    Plotly.restyle(this.chartId, {
      visible: visible
    }, [0]);
  }

  /**
   * show/hide 障礙物
   * @param visible 
   */
  switchShowObstacle(visible) {
    for (const item of this.rectList) {
      item.style['visibility'] = visible;
    }
  }

  /**
   * show/hide AP
   * @param visible 
   */
  switchShowCandidate(visible) {
    Plotly.restyle(this.chartId, {
      visible: visible
    }, [4]);

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
    const chartElm = document.querySelectorAll(`.signal_cover`)[0];
    let traceNum = 1;
    if (this.authService.isEmpty(this.calculateForm.ueCoordinate)) {
      traceNum = 0;
    }
    Plotly.restyle(chartElm, {
      opacity: this.opacityValue
    }, [traceNum]);
  }

}

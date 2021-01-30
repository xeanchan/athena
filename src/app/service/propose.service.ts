import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { CalculateForm } from '../form/CalculateForm';

declare var Plotly: any;

@Injectable({
  providedIn: 'root'
})
export class ProposeService {

  constructor(private authService: AuthService) { }

  plotLayout;
  /** result output */
  // result = {};
  // /** result input */
  // calculateForm = new CalculateForm();
  /** 建議方案 list */
  // candidateList = [];

  /** draw candidateBs layout */
  drawLayout(isPDF, calculateForm: CalculateForm, result) {
    const candidateList = [];
    const numMap = {};
    const xyMap = {};
    const color = [];
    let index = 1;
    const x = [];
    const y = [];
    const text = [];

    for (let i = 0; i < result['inputBsList'].length; i++) {
      numMap[result['inputBsList'][i]] = index;
      xyMap[result['inputBsList'][i]] = {
        x: result['inputBsList'][i][0],
        y: result['inputBsList'][i][1]
      };
      x.push(result['inputBsList'][i][0]);
      y.push(result['inputBsList'][i][1]);
      text.push(index);
      color.push('#7083d6');
      index++;
    }

    // 建議方案 list
    for (let i = 0; i < result['chosenCandidate'].length; i++) {
      if (typeof numMap[result['chosenCandidate'][i].toString()] !== 'undefined') {
        candidateList.push([
          numMap[result['chosenCandidate'][i].toString()],
          xyMap[result['chosenCandidate'][i].toString()].x,
          xyMap[result['chosenCandidate'][i].toString()].y,
          result['candidateBsPower'][i],
          result['candidateBeamId'][i]
        ]);
        color[numMap[result['chosenCandidate'][i]] - 1] = 'red';
      }
    }

    const reader = new FileReader();
    reader.readAsDataURL(this.authService.dataURLtoBlob(calculateForm.mapImage));
    reader.onload = (e) => {
      // draw background image chart
      const defaultPlotlyConfiguration = {
        displaylogo: false,
        showTips: false,
        editable: false,
        scrollZoom: false,
        displayModeBar: false
      };

      this.plotLayout = {
        autosize: true,
        xaxis: {
          linewidth: 1,
          mirror: 'all',
          range: [0, calculateForm.width],
          showgrid: false,
          zeroline: false,
          fixedrange: true
        },
        yaxis: {
          linewidth: 1,
          mirror: 'all',
          range: [0, calculateForm.height],
          showgrid: false,
          zeroline: false,
          fixedrange: true
        },
        margin: { t: 20, b: 20, l: 40},
        images: [{
          source: reader.result,
          x: 0,
          y: 0,
          sizex: calculateForm.width,
          sizey: calculateForm.height,
          xref: 'x',
          yref: 'y',
          xanchor: 'left',
          yanchor: 'bottom',
          sizing: 'stretch',
          layer: 'below'
        }],
        hovermode: 'closest'
      };

      let id;
      if (isPDF) {
        id = document.querySelector('#pdf_area').querySelector('#layout_chart');
      } else {
        id = document.querySelector('#layout_chart');
      }

      const traces = [];

      traces.push({
        type: 'scatter',
        mode: 'markers+text',
        x: x,
        y: y,
        text: text,
        marker: {
          size: 27,
          color: color
        },
        textfont: {
          size: 14,
          color: '#ffffff'
        },
        hoverinfo: 'x+y'
      });

      Plotly.newPlot(id, {
        data: traces,
        layout: this.plotLayout,
        config: defaultPlotlyConfiguration
      }).then((gd) => {
        const xy: SVGRectElement = gd.querySelector('.xy').querySelectorAll('rect')[0];
        const rect = xy.getBoundingClientRect();

        const image = new Image();
        image.src = reader.result.toString();
        image.onload = () => {
          let layoutOption;
          if (image.width > image.height) {
            const height = (image.height / image.width) * rect.width;
            layoutOption = {
              height: height
            };
          } else {
            const width = (image.width / image.height) * rect.height;
            layoutOption = {
              width: width
            };
          }

          Plotly.relayout(id, layoutOption);
        };
      });

    };

    return candidateList;
  }
}

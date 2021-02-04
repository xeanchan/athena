import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from '../../../service/auth.service';
import { CalculateForm } from '../../../form/CalculateForm';

declare var Plotly: any;

@Component({
  selector: 'app-propose',
  templateUrl: './propose.component.html',
  styleUrls: ['./propose.component.scss']
})
export class ProposeComponent implements OnInit {

  constructor(private authService: AuthService) { }

  plotLayout;
  /** result output */
  result = {};
  /** result input */
  calculateForm = new CalculateForm();
  /** 建議方案 list */
  candidateList = [];

  ngOnInit(): void {
  }

  /** draw layout */
  drawLayout(isPDF) {
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

      this.plotLayout = {
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
        images: [{
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
        }],
        hovermode: 'closest'
      };

      let id;
      if (isPDF) {
        id = document.querySelector('#pdf_area').querySelector('#layout_chart');
      } else {
        id = document.querySelector('#layout_chart');
      }

      // candidateBs
      let index = 1;
      const numMap = {};
      const xyMap = {};
      const x = [];
      const y = [];
      const text = [];
      const color = [];

      const candidateBs = this.calculateForm.candidateBs.split('|');
      for (let i = 0; i < candidateBs.length; i++) {
        const candidate = JSON.parse(candidateBs[i]);
        numMap[candidate] = index;
        xyMap[candidate] = {
          x: candidate[0],
          y: candidate[1]
        };
        x.push(candidate[0]);
        y.push(candidate[1]);
        text.push(index);
        color.push('#7083d6');
        index++;
      }

      const traces = [];
      // 建議方案 list
      for (let i = 0; i < this.result['chosenCandidate'].length; i++) {
        if (typeof numMap[this.result['chosenCandidate'][i].toString()] !== 'undefined') {
          this.candidateList.push([
            numMap[this.result['chosenCandidate'][i].toString()],
            xyMap[this.result['chosenCandidate'][i].toString()].x,
            xyMap[this.result['chosenCandidate'][i].toString()].y,
            this.result['candidateBsPower'][i],
            this.result['candidateBeamId'][i]
          ]);
          color[numMap[this.result['chosenCandidate'][i]] - 1] = 'red';
        }
      }

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
  }

}

import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
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
  @ViewChild('layoutChart') layoutChart: ElementRef;

  ngOnInit(): void {
  }

  /** draw layout */
  drawLayout(isPDF) {
    this.layoutChart.nativeElement.style.opacity = 0;
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
      const chosenNum = [];
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
          chosenNum.push(numMap[this.result['chosenCandidate'][i].toString()]);

          traces.push({
            type: 'scatter',
            mode: 'text',
            x: [xyMap[this.result['chosenCandidate'][i].toString()].x],
            y: [xyMap[this.result['chosenCandidate'][i].toString()].y],
            text: `${numMap[this.result['chosenCandidate'][i].toString()]}<br>✅`,
            marker: {
              size: 27,
              color: color,
              symbol: 'arrow-bar-down-open'
            },
            textfont: {
              size: 14,
              color: 'red'
            },
            hoverinfo: 'x+y',
            showlegend: false
          });
        }
      }

      for (let i = 0; i < x.length; i++) {
        if (!chosenNum.includes((i + 1))) {
          traces.push({
            type: 'scatter',
            mode: 'markers+text',
            x: [x[i]],
            y: [y[i]],
            text: text[i],
            marker: {
              size: 20,
              color: 'gray',
              symbol: 'x'
            },
            textfont: {
              size: 14,
              color: 'red'
            },
            textposition: 'center top',
            hoverinfo: 'x+y',
            showlegend: false
          });
        }
      }

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

          Plotly.relayout(id, layoutOption).then((gd) => {
            this.layoutChart.nativeElement.style.opacity = 1;
          });
        };
      });

    };
  }

}

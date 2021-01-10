import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from '../../../service/auth.service';

declare var Plotly: any;

@Component({
  selector: 'app-signal-quality',
  templateUrl: './signal-quality.component.html',
  styleUrls: ['./signal-quality.component.scss']
})
export class SignalQualityComponent implements OnInit {

  constructor(private authService: AuthService) { }

  plotLayout;
  calculateForm;

  ngOnInit(): void {
  }

  draw(isPDF) {
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
          hover: 'x+y'
        }]
      };

      let id;
      if (isPDF) {
        id = document.querySelector('#pdf_area').querySelector('#quality_chart');
      } else {
        id = document.querySelector('#quality_chart');
      }

      Plotly.newPlot(id, {
        data: [],
        layout: this.plotLayout,
        config: defaultPlotlyConfiguration
      });
    };
  }

}

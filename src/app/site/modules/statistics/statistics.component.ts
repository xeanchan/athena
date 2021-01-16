import { Component, OnInit, Input } from '@angular/core';
import { CalculateForm } from '../../../form/CalculateForm';

declare var Plotly: any;

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {

  constructor() { }

  result = {};
  calculateForm = new CalculateForm();

  defaultPlotlyConfiguration = {
    displaylogo: false,
    showTips: false,
    editable: false,
    scrollZoom: false,
    displayModeBar: false
  };
  /** 背景色 */
  bgColor = 'rbga(0, 0, 0, 0)';
  /** 文字顏色 */
  textColor = '#ffffff';

  ngOnInit(): void {
  }

  drawChart(isPDF) {
    if (isPDF) {
      this.bgColor = '#ffffff';
      this.textColor = '#000000';
    } else {
      this.bgColor = '#00000000';
      this.textColor = '#ffffff';
    }
    this.drawModulation(isPDF);
    this.drawUEModulation(isPDF);
    // UE訊號強度統計
    this.drawUESignal(isPDF);
    // UE訊號強度CDF圖
    this.drawUESignalCDF(isPDF);
  }

  /** UE Modulation統計 */
  drawModulation(isPDF) {
    const layout = {
      autosize: true,
      title: {
        text: 'UE Modulation統計',
        font: {
          color: this.textColor
        }
      },
      xaxis: {
        linewidth: 1,
        mirror: 'all',
        showgrid: false,
        zeroline: false,
        fixedrange: true,
        tickfont: {
          color: this.textColor
        },
        title: {
          text: '調變類型',
          font: {
            color: this.textColor
          }
        }
      },
      yaxis: {
        linewidth: 1,
        mirror: 'all',
        showgrid: false,
        zeroline: false,
        fixedrange: true,
        tickfont: {
          color: this.textColor
        },
        title: {
          text: '行動終端總數',
          font: {
            color: this.textColor
          }
        }
      },
      margin: { t: 30, b: 40, l: 50, r: 10},
      hovermode: 'closest',
      paper_bgcolor: this.bgColor,
      plot_bgcolor: this.bgColor,
    };

    let id;
    if (isPDF) {
      id = document.querySelector('#pdf_area').querySelector('#UE_Modulation');
    } else {
      id = document.querySelector('#UE_Modulation');
    }

    const traces = [];
    const x = ['QPSK', '16-QAM', '64-QAM'];
    const y = this.result['ueModulationCount'];
    const text = [];
    const sum = Plotly.d3.sum(y);
    const fmt = Plotly.d3.format('.0%');
    text.push(fmt(y[0] / sum));
    text.push(fmt(y[1] / sum));
    text.push(fmt(y[2] / sum));

    traces.push({
      type: 'bar',
      x: x,
      y: y,
      text: text,
      textposition: 'outside',
      textfont: {
        size: 14,
        color: this.textColor
      },
      hoverinfo: 'x+y'
    });

    Plotly.newPlot(id, {
      data: traces,
      layout: layout,
      config: this.defaultPlotlyConfiguration
    });
  }

  /** UE Modulation CDF圖 */
  drawUEModulation(isPDF) {
    const layout = {
      autosize: true,
      title: {
        text: 'UE Modulation CDF圖',
        font: {
          color: this.textColor
        }
      },
      xaxis: {
        linewidth: 1,
        mirror: 'all',
        showgrid: false,
        zeroline: false,
        fixedrange: true,
        tickfont: {
          color: this.textColor
        },
        title: {
          text: '調變類型',
          font: {
            color: this.textColor
          }
        }
      },
      yaxis: {
        linewidth: 1,
        mirror: 'all',
        showgrid: false,
        zeroline: false,
        fixedrange: true,
        tickfont: {
          color: this.textColor
        },
        title: {
          text: '累計比率',
          font: {
            color: this.textColor
          }
        },
        tickformat: ',.0%',
        range: [0, 1.05]
      },
      margin: { t: 30, b: 40, l: 50, r: 10},
      hovermode: 'closest',
      paper_bgcolor: this.bgColor,
      plot_bgcolor: this.bgColor,
    };

    let id;
    if (isPDF) {
      id = document.querySelector('#pdf_area').querySelector('#UE_Modulation_CDF');
    } else {
      id = document.querySelector('#UE_Modulation_CDF');
    }

    const traces = [];
    const x = ['QPSK', '16-QAM', '64-QAM'];
    const y = [];
    const text = [];
    const data = this.result['ueModulationCount'];
    const sum = Plotly.d3.sum(data);
    let percentage = 0;
    // CDF百分比
    const fmt = Plotly.d3.format('.0%');
    for (let i = 0; i < data.length; i++) {
      percentage = data[i] / sum + percentage;
      y.push(percentage);
      text.push(fmt(percentage));
    }

    traces.push({
      type: 'scatter',
      mode: 'lines+text',
      x: x,
      y: y,
      text: text,
      textposition: 'top',
      textfont: {
        size: 14,
        color: this.textColor
      },
      line: {
        width: 3
      },
      hoverinfo: 'x+y'
    });

    Plotly.newPlot(id, {
      data: traces,
      layout: layout,
      config: this.defaultPlotlyConfiguration
    });
  }

  /** UE訊號強度統計 */
  drawUESignal(isPDF) {
    const layout = {
      autosize: true,
      title: {
        text: 'UE訊號強度統計',
        font: {
          color: this.textColor
        }
      },
      xaxis: {
        linewidth: 1,
        mirror: 'all',
        showgrid: false,
        zeroline: false,
        fixedrange: true,
        tickfont: {
          color: this.textColor
        },
        title: {
          text: '訊號強度(格數)',
          font: {
            color: this.textColor
          }
        },
        tickvals: ['0', '1', '2', '3', '4', '5'],
        ticktext: ['0', '1', '2', '3', '4', '5']
      },
      yaxis: {
        linewidth: 1,
        mirror: 'all',
        showgrid: false,
        zeroline: false,
        fixedrange: true,
        tickfont: {
          color: this.textColor
        },
        title: {
          text: '行動終端總數',
          font: {
            color: this.textColor
          }
        }
      },
      margin: { t: 30, b: 40, l: 50, r: 10},
      hovermode: 'closest',
      paper_bgcolor: this.bgColor,
      plot_bgcolor: this.bgColor,
    };

    let id;
    if (isPDF) {
      id = document.querySelector('#pdf_area').querySelector('#UE_SIGNAL');
    } else {
      id = document.querySelector('#UE_SIGNAL');
    }

    const traces = [];
    const x = ['0', '1', '2', '3', '4', '5'];
    const y = this.result['ueSignalLevelCount'];
    const text = [];
    const sum = Plotly.d3.sum(y);
    const fmt = Plotly.d3.format('.0%');
    for (let i = 0; i < y.length; i++) {
      text.push(fmt(y[i] / sum));
    }

    traces.push({
      type: 'bar',
      x: x,
      y: y,
      text: text,
      textposition: 'outside',
      textfont: {
        size: 14,
        color: this.textColor
      },
      hoverinfo: 'x+y'
    });

    Plotly.newPlot(id, {
      data: traces,
      layout: layout,
      config: this.defaultPlotlyConfiguration
    });
  }

  /** UE訊號強度CDF圖 */
  drawUESignalCDF(isPDF) {
    const layout = {
      autosize: true,
      title: {
        text: 'UE訊號強度CDF圖',
        font: {
          color: this.textColor
        }
      },
      xaxis: {
        linewidth: 1,
        mirror: 'all',
        showgrid: false,
        zeroline: false,
        fixedrange: true,
        tickfont: {
          color: this.textColor
        },
        title: {
          text: '訊號強度(格數)',
          font: {
            color: this.textColor
          }
        },
        tickvals: ['0', '1', '2', '3', '4', '5'],
        ticktext: ['0', '1', '2', '3', '4', '5']
      },
      yaxis: {
        linewidth: 1,
        mirror: 'all',
        showgrid: false,
        zeroline: false,
        fixedrange: true,
        tickfont: {
          color: this.textColor
        },
        title: {
          text: '累計比率',
          font: {
            color: this.textColor
          }
        },
        tickformat: ',.0%',
        range: [0, 1.05]
      },
      margin: { t: 30, b: 40, l: 50, r: 10},
      hovermode: 'closest',
      paper_bgcolor: this.bgColor,
      plot_bgcolor: this.bgColor,
    };

    let id;
    if (isPDF) {
      id = document.querySelector('#pdf_area').querySelector('#UE_SIGNAL_CDF');
    } else {
      id = document.querySelector('#UE_SIGNAL_CDF');
    }

    const traces = [];
    const x = ['0', '1', '2', '3', '4', '5'];
    const y = [];
    const text = [];
    const data = this.result['ueSignalLevelCount'];
    const sum = Plotly.d3.sum(data);
    let percentage = 0;
    // CDF百分比
    const fmt = Plotly.d3.format('.0%');
    for (let i = 0; i < data.length; i++) {
      percentage = data[i] / sum + percentage;
      y.push(percentage);
      text.push(fmt(percentage));
    }

    traces.push({
      type: 'scatter',
      mode: 'lines+text',
      x: x,
      y: y,
      text: text,
      textposition: 'top',
      textfont: {
        size: 14,
        color: this.textColor
      },
      line: {
        width: 3
      },
      hoverinfo: 'x+y'
    });

    Plotly.newPlot(id, {
      data: traces,
      layout: layout,
      config: this.defaultPlotlyConfiguration
    });
  }

}

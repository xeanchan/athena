import { Component, OnInit, Input } from '@angular/core';
import { CalculateForm } from '../../../form/CalculateForm';
import { TranslateService } from '@ngx-translate/core';

declare var Plotly: any;

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {

  constructor(private translateService: TranslateService) { }

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
  zValues = [];
  fmt = Plotly.d3.format('.2%');

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
    this.zValues = this.calculateForm.zValue.replace('[', '').replace(']', '') .split(',');
    // 場域Modulation統計
    this.drawLayerModulation(isPDF);
    // 場域Modulation CDF圖
    this.drawLayerModulationCDF(isPDF);
    // 場域訊號強度統計
    this.drawLayerSignal(isPDF);
    // 場域訊號強度CDF圖
    this.drawLayerSignalCDF(isPDF);
    // 行動終端Modulation統計
    this.drawUEModulation(isPDF);
    // 行動終端Modulation CDF圖
    this.drawUEModulationCDF(isPDF);
    // UE訊號強度統計
    this.drawUESignal(isPDF);
    // UE訊號強度CDF圖
    this.drawUESignalCDF(isPDF);
  }

  /** 場域Modulation統計 */
  drawLayerModulation(isPDF) {
    const layout = {
      autosize: true,
      title: {
        text: this.translateService.instant('statistics.site_modulation'),
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
          text: '參考點總數',
          font: {
            color: this.textColor
          }
        }
      },
      margin: { t: 30, b: 40, l: 50, r: 10},
      hovermode: 'closest',
      paper_bgcolor: this.bgColor,
      plot_bgcolor: this.bgColor,
      barmode: 'group',
      bargroupgap: 0.1,
      legend: {
        orientation: 'h'
      }
    };

    let id;
    if (isPDF) {
      id = document.querySelector('#pdf_area').querySelector('#LAYER_Modulation');
    } else {
      id = document.querySelector('#LAYER_Modulation');
    }

    const traces = [];
    const x = ['QPSK', '16-QAM', '64-QAM'];
    const y = [];
    const text = [];
    let k = 0;
    for (const item of this.result['layeredModulationCount']) {
      const len = item.length;
      for (let i = 0; i < len; i++) {
        if (k === 0) {
          y.push([]);
          text.push([]);
        }
        y[i].push(item[i]);
      }
      k++;
    }

    for (let i = 0; i < y.length; i++) {
      const sum = Plotly.d3.sum(y[i]);
      text[i].push(this.fmt(y[i][0] / sum));
      text[i].push(this.fmt(y[i][1] / sum));
      text[i].push(this.fmt(y[i][2] / sum));

      traces.push({
        type: 'bar',
        x: x,
        y: y[i],
        text: text[i],
        name: this.zValues[i] + 'm',
        textposition: 'outside',
        hovertemplate: `%{x}<br>${this.zValues[i]}m: %{y}<extra></extra>`,
        textfont: {
          size: 14,
          color: this.textColor
        }
      });
    }

    Plotly.newPlot(id, {
      data: traces,
      layout: layout,
      config: this.defaultPlotlyConfiguration
    });
  }

  /** 場域Modulation CDF圖 */
  drawLayerModulationCDF(isPDF) {
    const layout = {
      autosize: true,
      title: {
        text: this.translateService.instant('statistics.site_modulation_cdf'),
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
      legend: {
        orientation: 'h'
      }
    };

    let id;
    if (isPDF) {
      id = document.querySelector('#pdf_area').querySelector('#LAYER_Modulation_CDF');
    } else {
      id = document.querySelector('#LAYER_Modulation_CDF');
    }

    const traces = [];
    const x = ['QPSK', '16-QAM', '64-QAM'];
    const y = [];
    const yData = [];
    const text = [];
    const percentage = [];
    const data = this.result['layeredModulationCount'];
    let k = 0;
    for (const item of data) {
      const len = item.length;
      for (let i = 0; i < len; i++) {
        if (k === 0) {
          yData.push([]);
          y.push([]);
          text.push([]);
          percentage.push(0);
        }
        yData[i].push(item[i]);
      }
      k++;
    }

    for (let i = 0; i < yData.length; i++) {
      const sum = Plotly.d3.sum(yData[i]);
      for (const item of yData[i]) {
        percentage[i] = item / sum + percentage[i];
        y[i].push(percentage[i]);
        text[i].push(this.fmt(percentage[i]));
      }
      traces.push({
        type: 'scatter',
        mode: 'lines+text',
        x: x,
        y: y[i],
        text: text[i],
        textposition: 'top',
        name: this.zValues[i] + 'm',
        hovertemplate: `%{x}<br>${this.zValues[i]}m: %{y}<extra></extra>`,
        textfont: {
          size: 14,
          color: this.textColor
        },
        line: {
          width: 3
        }
      });
    }

    Plotly.newPlot(id, {
      data: traces,
      layout: layout,
      config: this.defaultPlotlyConfiguration
    });
  }

  /** 行動終端Modulation統計 */
  drawUEModulation(isPDF) {
    const layout = {
      autosize: true,
      title: {
        text: this.translateService.instant('statistics.ue_modulation'),
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

  /** 場域訊號強度統計 */
  drawLayerSignal(isPDF) {
    const layout = {
      autosize: true,
      title: {
        text: this.translateService.instant('statistics.site_signal'),
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
          text: '參考點總數',
          font: {
            color: this.textColor
          }
        }
      },
      margin: { t: 30, b: 40, l: 50, r: 10},
      hovermode: 'closest',
      paper_bgcolor: this.bgColor,
      plot_bgcolor: this.bgColor,
      barmode: 'group',
      bargroupgap: 0.1,
      legend: {
        orientation: 'h'
      }
    };

    let id;
    if (isPDF) {
      id = document.querySelector('#pdf_area').querySelector('#LAYER_SIGNAL');
    } else {
      id = document.querySelector('#LAYER_SIGNAL');
    }

    const traces = [];
    const x = ['0', '1', '2', '3', '4', '5'];
    const y = [];
    const data = this.result['layeredSignalLevelCount'];
    const text = [];
    let k = 0;
    for (const item of data) {
      const len = item.length;
      for (let i = 0; i < len; i++) {
        if (k === 0) {
          y.push([]);
          text.push([]);
        }
        y[i].push(item[i]);
      }
      k++;
    }

    for (let i = 0; i < y.length; i++) {
      const sum = Plotly.d3.sum(y[i]);
      for (const item of y[i]) {
        text[i].push(this.fmt(item / sum));
      }
      traces.push({
        type: 'bar',
        x: x,
        y: y[i],
        text: text[i],
        name: this.zValues[i] + 'm',
        textposition: 'outside',
        hovertemplate: `%{x}<br>${this.zValues[i]}m: %{y}<extra></extra>`,
        textfont: {
          size: 14,
          color: this.textColor
        }
      });
    }

    Plotly.newPlot(id, {
      data: traces,
      layout: layout,
      config: this.defaultPlotlyConfiguration
    });
  }

  /** 場域訊號強度CDF圖 */
  drawLayerSignalCDF(isPDF) {
    const layout = {
      autosize: true,
      title: {
        text: this.translateService.instant('statistics.site_signal_cdf'),
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
      legend: {
        orientation: 'h'
      }
    };

    let id;
    if (isPDF) {
      id = document.querySelector('#pdf_area').querySelector('#LAYER_SIGNAL_CDF');
    } else {
      id = document.querySelector('#LAYER_SIGNAL_CDF');
    }

    const traces = [];
    const x = ['0', '1', '2', '3', '4', '5'];
    const y = [];
    const text = [];
    const data = this.result['layeredSignalLevelCount'];
    const yData = [];
    const percentage = [];
    let k = 0;
    for (const item of data) {
      const len = item.length;
      for (let i = 0; i < len; i++) {
        if (k === 0) {
          yData.push([]);
          y.push([]);
          text.push([]);
          percentage.push(0);
        }
        yData[i].push(item[i]);
      }
      k++;
    }

    for (let i = 0; i < yData.length; i++) {
      const sum = Plotly.d3.sum(yData[i]);
      for (const item of yData[i]) {
        percentage[i] = item / sum + percentage[i];
        y[i].push(percentage[i]);
        text[i].push(this.fmt(percentage[i]));
      }
      traces.push({
        type: 'scatter',
        mode: 'lines+text',
        x: x,
        y: y[i],
        text: text[i],
        textposition: 'top',
        name: this.zValues[i] + 'm',
        hovertemplate: `%{x}<br>${this.zValues[i]}m: %{y}<extra></extra>`,
        textfont: {
          size: 14,
          color: this.textColor
        },
        line: {
          width: 3
        }
      });
    }

    Plotly.newPlot(id, {
      data: traces,
      layout: layout,
      config: this.defaultPlotlyConfiguration
    });
  }

  /** 行動終端Modulation CDF圖 */
  drawUEModulationCDF(isPDF) {
    const layout = {
      autosize: true,
      title: {
        text: this.translateService.instant('statistics.ue_modulation_cdf'),
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
        text: this.translateService.instant('statistics.ue_signal'),
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
        text: this.translateService.instant('statistics.ue_signal_cdf'),
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

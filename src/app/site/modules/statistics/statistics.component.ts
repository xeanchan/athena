import { Component, OnInit, Input } from '@angular/core';
import { CalculateForm } from '../../../form/CalculateForm';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../service/auth.service';

declare var Plotly: any;

/**
 * 結果頁統計圖
 */
@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {

  constructor(
    private translateService: TranslateService,
    public authService: AuthService) { }

  /** 結果form */
  calculateForm = new CalculateForm();
  /** 結果data */
  result = {};
  /** plotly config */
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
  /** 高度list */
  zValues = [];
  /** 數值格式化 */
  fmt = Plotly.d3.format('.2%');
  /** 顯示UE統計圖 */
  showUE = true;

  ngOnInit(): void {
  }

  /**
   * 畫圖
   * @param isPDF 
   */
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

    if (!this.authService.isEmpty(this.calculateForm.ueCoordinate)) {
      // 行動終端Modulation統計
      this.drawUEModulation(isPDF);
      // 行動終端Modulation CDF圖
      this.drawUEModulationCDF(isPDF);
      // UE訊號強度統計
      this.drawUESignal(isPDF);
      // UE訊號強度CDF圖
      this.drawUESignalCDF(isPDF);
    } else {
      this.showUE = false;
    }
    
  }

  /**
   * 場域Modulation統計
   * @param isPDF 
   */
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
          text: this.translateService.instant('statistics.modulation.type'),
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
          text: this.translateService.instant('statistics.ref.points'),
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
        orientation: 'h',
        x: -0.1
      }
    };

    let id;
    if (isPDF) {
      id = document.querySelector('#pdf_area').querySelector('#LAYER_Modulation');
    } else {
      id = document.querySelector('#LAYER_Modulation');
    }

    const traces = [];
    const layeredLen = this.result['layeredModulationCount'].length;
    let x = ['QPSK', '16-QAM', '64-QAM'];
    if (Number(this.calculateForm.objectiveIndex) === 2) {
      // WIFI
      if (layeredLen === 5) {
        x = ['BPSK', 'QPSK', '16-QAM', '64-QAM', '256-QAM'];
      }
    } else if (Number(this.calculateForm.objectiveIndex) === 1) {
      // 5G
      if (layeredLen === 4) {
        x = ['QPSK', '16-QAM', '64-QAM', '256-QAM'];
      }
    }
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
      for (let n = 0; n < layeredLen; n++) {
        text[i].push((y[i][n] === 0 ? 0 : this.fmt(y[i][n] / sum)));
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

  /**
   * 場域Modulation CDF圖
   * @param isPDF 
   */
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
          text: this.translateService.instant('statistics.modulation.type'),
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
          text: this.translateService.instant('statistics.cumulative.ratio'),
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
        orientation: 'h',
        x: -0.1
      }
    };

    let id;
    if (isPDF) {
      id = document.querySelector('#pdf_area').querySelector('#LAYER_Modulation_CDF');
    } else {
      id = document.querySelector('#LAYER_Modulation_CDF');
    }

    const traces = [];
    const layeredLen = this.result['layeredModulationCount'].length;
    let x = ['QPSK', '16-QAM', '64-QAM'];
    if (Number(this.calculateForm.objectiveIndex) === 2) {
      // WIFI
      if (layeredLen === 5) {
        x = ['BPSK', 'QPSK', '16-QAM', '64-QAM', '256-QAM'];
      }
    } else if (Number(this.calculateForm.objectiveIndex) === 1) {
      // 5G
      if (layeredLen === 4) {
        x = ['QPSK', '16-QAM', '64-QAM', '256-QAM'];
      }
    }
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

  /**
   * 行動終端Modulation統計
   * @param isPDF 
   */
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
          text: this.translateService.instant('statistics.modulation.type'),
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
          text: this.translateService.instant('statistics.ue.count'),
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
    const layeredLen = this.result['ueModulationCount'].length;
    let x = ['QPSK', '16-QAM', '64-QAM'];
    if (Number(this.calculateForm.objectiveIndex) === 2) {
      // WIFI
      if (layeredLen === 5) {
        x = ['BPSK', 'QPSK', '16-QAM', '64-QAM', '256-QAM'];
      }
    } else if (Number(this.calculateForm.objectiveIndex) === 1) {
      // 5G
      if (layeredLen === 4) {
        x = ['QPSK', '16-QAM', '64-QAM', '256-QAM'];
      }
    }
    const y = this.result['ueModulationCount'];
    const text = [];
    if (this.calculateForm.ueCoordinate !== '') {
      const sum = Plotly.d3.sum(y);
      const fmt = Plotly.d3.format('.0%');
      for (let i = 0; i < layeredLen; i++) {
        text.push(fmt(y[i] / sum));
      }
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

  /**
   * 場域訊號強度統計
   * @param isPDF 
   */
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
          text: this.translateService.instant('statistics.sinr'),
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
          text: this.translateService.instant('statistics.ref.points'),
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
        orientation: 'h',
        x: -0.1
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
        text[i].push((item === 0 ? 0 : this.fmt(item / sum)));
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

  /**
   * 場域訊號強度CDF圖
   * @param isPDF 
   */
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
          text: this.translateService.instant('statistics.sinr'),
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
          text: this.translateService.instant('statistics.cumulative.ratio'),
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
        orientation: 'h',
        x: -0.1
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

  /**
   * 行動終端Modulation CDF圖
   * @param isPDF 
   */
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
          text: this.translateService.instant('statistics.modulation.type'),
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
          text: this.translateService.instant('statistics.cumulative.ratio'),
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
    const layeredLen = this.result['ueModulationCount'].length;
    let x = ['QPSK', '16-QAM', '64-QAM'];
    if (Number(this.calculateForm.objectiveIndex) === 2) {
      // WIFI
      if (layeredLen === 5) {
        x = ['BPSK', 'QPSK', '16-QAM', '64-QAM', '256-QAM'];
      }
    } else if (Number(this.calculateForm.objectiveIndex) === 1) {
      // 5G
      if (layeredLen === 4) {
        x = ['QPSK', '16-QAM', '64-QAM', '256-QAM'];
      }
    }
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

  /**
   * UE訊號強度統計
   * @param isPDF 
   */
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
          text: this.translateService.instant('statistics.sinr'),
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
          text: this.translateService.instant('statistics.ue.count'),
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
    if (this.calculateForm.ueCoordinate !== '') {
      const sum = Plotly.d3.sum(y);
      const fmt = Plotly.d3.format('.0%');
      for (let i = 0; i < y.length; i++) {
        text.push(fmt(y[i] / sum));
      }
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

  /**
   * UE訊號強度CDF圖
   * @param isPDF 
   */
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
          text: this.translateService.instant('statistics.sinr'),
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
          text: this.translateService.instant('statistics.cumulative.ratio'),
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

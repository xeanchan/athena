import { Component, OnInit, HostListener, ViewChild, ElementRef, AfterViewInit, OnDestroy, Input } from '@angular/core';
import { OnPinch, OnScale, OnDrag, OnRotate, OnResize, OnWarp, MoveableGroupInterface, BeforeRenderableProps } from 'moveable';
import { Frame } from 'scenejs';
import { NgxMoveableComponent } from 'ngx-moveable';
import { TaskFormService } from '../task-form.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { CalculateForm } from '../../form/CalculateForm';
import * as _ from 'lodash';
import { MatTooltip } from '@angular/material/tooltip';

declare var Plotly: any;

interface PlotHTMLElement extends HTMLElement {
  on(eventName: string, handler: any): void;
}

@Component({
  selector: 'app-site-planning',
  templateUrl: './site-planning.component.html',
  styleUrls: ['./site-planning.component.scss']
})
export class SitePlanningComponent implements OnInit, AfterViewInit {

  constructor(
    private taskFormService: TaskFormService,
    private router: Router,
    private matDialog: MatDialog,
    private http: HttpClient) { }

  @ViewChild('moveable') moveable: NgxMoveableComponent;
  // @ViewChildren(TemplateRef) templateList: QueryList<TemplateRef<any>>;

  target;
  scalable = true;
  resizable = false;
  warpable = false;
  frame = new Frame({
    width: '50px',
    height: '50px',
    left: '0px',
    top: '0px',
    transform: {
      rotate: '0deg',
      scaleX: 1.64,
      scaleY: 1,
      matrix3d: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
    }
  });
  iconList = [1, 2, 3];
  // target;

  opened = true;
  panelOpenState = false;
  matrix;
  live = false;
  /** calculate form */
  calculateForm: CalculateForm;
  /** upload image src */
  imageSrc;
  /** subitem class */
  subitemClass = {
    obstacle: 'subitem active',
    ue: 'subitem active'
  };
  /** 平面高度 */
  zValues = ['', '', ''];
  /** 障礙物 */
  obstacleList = [];
  obstacleObject = {};
  // 比例尺公式
  xLinear;
  yLinear;
  // chart邊界
  chartLeft = 0;
  chartRight = 0;
  chartTop = 0;
  chartBottom = 0;
  targetObject;
  svgMap = {
    svg_01: {
      id: 'svg_1',
      title: '障礙物'
    },
    svg_02: {
      id: 'svg_2',
      title: '障礙物'
    },
    svg_03: {
      id: 'svg_3',
      title: '障礙物'
    },
    svg_04: {
      id: 'svg_4',
      title: '現有基站'
    },
    svg_05: {
      id: 'svg_5',
      title: '新增基站'
    },
    svg_06: {
      id: 'svg_6',
      title: '新增ＵＥ'
    }
  };
  // select svg id
  svgId;
  scalex;
  scaley;
  tooltipStr = '';
  // round
  roundFormat = Plotly.d3.format('.1f');
  // bounds = {
  //   left: 150,
  //   top: 0,
  //   right: 300,
  //   bottom: 500
  // };
  @Input() public bounds!: { left?: 10, top?: 20, right?: 70, bottom?: 50 };
  @Input() public container!: SVGElement | HTMLElement | null;

  @ViewChild('msgLabel') label: ElementRef;
  @ViewChild('tooltip') tooltip: MatTooltip;
  @ViewChild('chart') chart: ElementRef;

  @HostListener('document:click', ['$event'])
  clickout(event) {
    if (typeof this.target !== 'undefined') {
      if (this.target.contains(event.target)) {
        this.live = true;
      } else {
        this.moveable.destroy();
        this.live = false;
      }
    }
  }

  ngOnInit() {
    this.calculateForm = JSON.parse(sessionStorage.getItem('calculateForm'));
    // console.log(this.taskFormService.calculateForm);
    this.initData();
  }

  ngAfterViewInit(): void {
    // this.tools = _.cloneDeep(document.querySelector('.tool').innerHTML);
    // this.moveable.destroy();
  }

  /**
   * init data
   */
  initData() {
    if (this.calculateForm.mapImage != null) {
      const reader = new FileReader();
      reader.readAsDataURL(this.dataURLtoBlob(this.calculateForm.mapImage));
      reader.onload = (e) => {

        // draw background image chart
        const defaultPlotlyConfiguration = {
          displaylogo: false,
          showTips: false,
          editable: false,
          scrollZoom: false,
          displayModeBar: false
        };

        const pLayout = {
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

        Plotly.newPlot('chart', {
          data: [],
          layout: pLayout,
          config: defaultPlotlyConfiguration
        }).then((gd) => {
          // 比例尺計算
          const xy: SVGRectElement = gd.querySelector('.xy').querySelectorAll('rect')[0];
          const rect = xy.getBoundingClientRect();
          this.chartLeft = rect.left;
          this.chartRight = rect.right;
          this.chartTop = rect.top;
          this.chartBottom = rect.bottom;

          this.xLinear = Plotly.d3.scale.linear()
            .domain([0, rect.width])
            .range([0, this.calculateForm.width]);

          this.yLinear = Plotly.d3.scale.linear()
            .domain([0, rect.height])
            .range([0, this.calculateForm.height]);

        });
      };
    }
  }

  /**
   * dataURI to blob
   * @param dataURI
   */
  dataURLtoBlob(dataURI) {
    let byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0) {
      byteString = atob(dataURI.split(',')[1]);
    } else {
      byteString = unescape(dataURI.split(',')[1]);
    }
    // separate out the mime component
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    // write the bytes of the string to a typed array
    const ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ia], {type: mimeString});
  }

  moveClick(event) {
    if (this.live) {
      this.moveable.destroy();
    }
    this.live = !this.live;
    if (event.target.getAttribute('class').indexOf('drag_rect') === -1) {
      const svg = event.target.closest('svg');
      this.svgId = svg.id;
      const len = this.obstacleList.length;
      this.obstacleList.push(this.svgId);
      this.obstacleObject[this.svgId] = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        altitude: this.calculateForm.altitude,
        rotate: 0,
        title: this.svgMap[this.svgId].title
      };

      this.frame = new Frame({
        width: '30px',
        height: '30px',
        left: '200px',
        top: '250px',
        transform: {
          rotate: '0deg',
          scaleX: 1,
          scaleY: 1,
          matrix3d: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
        }
      });

      window.setTimeout(() => {

        const span = document.querySelectorAll('.dragList');
        const rect = svg.querySelector(`#${this.svgMap[svg.id].id}`);
        rect.setAttribute('fill', 'green');
        rect.setAttribute('class', 'drag_rect');
        span[span.length - 1].innerHTML += svg.outerHTML;
        this.target = span[span.length - 1];

        this.target.bounds = this.bounds;
        this.target.dragArea = document.getElementById('chart');

        // 還原來源顏色 & class
        event.target.setAttribute('fill', '#ffffff');
        event.target.setAttribute('class', 'target');

        this.moveable.ngOnInit();
        this.setTooltip();
        this.tooltip.show();
      }, 0);
    } else {
      this.target = event.target.closest('span');
      this.moveable.ngOnInit();
      this.setTooltip();
      this.tooltip.show();
    }
  }

  newElementClick(event) {
    if (this.live) {
      this.moveable.destroy();
    }
    this.live = !this.live;
    this.target = event.target;
    this.moveable.ngOnInit();
  }

  onWindowReisze = () => {
    this.moveable.updateRect();
  }
  clickScalable() {
    this.scalable = true;
    this.resizable = false;
    this.warpable = false;
  }
  clickResizable() {
    this.scalable = false;
    this.resizable = true;
    this.warpable = false;
  }
  clickWarpable() {
    this.scalable = false;
    this.resizable = false;
    this.warpable = true;
  }

  setTransform(target) {
    target.style.cssText = this.frame.toCSS();
  }

  setLabel(clientX, clientY, text) {
    this.label.nativeElement.style.cssText =
      `display: block; transform: translate(${clientX}px,
      ${clientY - 10}px) translate(-100%, -100%) translateZ(-100px);`;

    this.label.nativeElement.innerHTML = text;
  }

  onPinch({ target, clientX, clientY }: OnPinch) {
    setTimeout(() => {
      this.setLabel(
        clientX,
        clientY,
          `X: ${this.frame.get('left')}
          <br/>Y: ${this.frame.get('top')}
          <br/>W: ${this.frame.get('width')}
          <br/>H: ${this.frame.get('height')}
          <br/>S: ${this.frame.get('transform', 'scaleX').toFixed(2)}, ${this.frame.get('transform', 'scaleY').toFixed(2)}
          <br/>R: ${parseFloat(this.frame.get('transform', 'rotate')).toFixed(1)}deg`
      );
    });
  }

  setTooltip() {
    const rect = this.target.closest('span').getBoundingClientRect();
    const rectLeft = rect.left - this.chartLeft;
    const rectBottom = this.chartBottom - rect.bottom;
    let xVal = this.roundFormat(this.xLinear(rectLeft));
    if (xVal < 0) {
      xVal = 0;
    }
    const yVal = this.roundFormat(this.yLinear(rectBottom));
    const wVal = this.roundFormat(this.xLinear(rect.width));
    const hVal = this.roundFormat(this.yLinear(rect.height));
    this.tooltipStr = `${this.svgMap[this.svgId].title}
      X: ${xVal}
      Y: ${yVal}
      長: ${wVal}
      寬: ${hVal}
      高: ${this.calculateForm.altitude}`;

    this.obstacleObject[this.svgId] = {
      x: xVal,
      y: yVal,
      width: wVal,
      height: hVal,
      altitude: this.calculateForm.altitude,
      rotate: 0,
      title: this.svgMap[this.svgId].title
    };
  }

  dragStart(moveable: MoveableGroupInterface<BeforeRenderableProps>, e: any) {

    e.bounds = this.bounds;
  }

  onDrag({ target, clientX, clientY, top, left, isPinch }: OnDrag) {

    const rect = target.closest('span').getBoundingClientRect();
    const rectLeft = rect.left;
    const rectRight = rect.right;
    const rectTop = rect.top;
    const rectBottom = rect.bottom;

    if (rectLeft > this.chartLeft - 1 && rectRight < this.chartRight
      && rectTop > this.chartTop && rectBottom < this.chartBottom) {
      this.frame.set('left', `${left}px`);
      this.frame.set('top', `${top}px`);
      this.setTransform(target);
      if (!isPinch) {
        this.setLabel(clientX, clientY, `X: ${left}px<br/>Y: ${top}px`);
      }

    } else {
      if (rectLeft < this.chartLeft) {
        this.frame.set('left', `${this.chartLeft}px`);
        this.setTransform(target);
        target.closest('span').style.left = `${152}px`;
      } else if (rectTop <= this.chartTop) {
        this.frame.set('top', `${this.chartTop + 1}px`);
        this.setTransform(target);
        const t = Number(target.closest('span').style.top.replace('px', ''));
        target.closest('span').style.top = `${t + 1}px`;
      } else if (rectRight >= this.chartRight) {
        this.frame.set('left', `${rectLeft - 1}px`);
        this.setTransform(target);
        const t = Number(target.closest('span').style.left.replace('px', ''));
        target.closest('span').style.left = `${t - 1}px`;
      } else if (rectBottom >= this.chartBottom) {
        this.frame.set('top', `${rectTop - 1}px`);
        this.setTransform(target);
        const t = Number(target.closest('span').style.top.replace('px', ''));
        target.closest('span').style.top = `${t - 1}px`;
      }
    }
    this.setTooltip();
  }

  onScale({ target, delta, clientX, clientY, isPinch }: OnScale) {
    const scaleX = this.frame.get('transform', 'scaleX') * delta[0];
    const scaleY = this.frame.get('transform', 'scaleY') * delta[1];
    this.frame.set('transform', 'scaleX', scaleX);
    this.frame.set('transform', 'scaleY', scaleY);
    this.setTransform(target);
    if (!isPinch) {
      this.setLabel(
        clientX,
        clientY,
        `S: ${scaleX.toFixed(2)}, ${scaleY.toFixed(2)}`
      );
    }
    this.scalex = scaleX;
  }

  onRotate({ target, clientX, clientY, beforeDelta, isPinch }: OnRotate) {
    const deg = parseFloat(this.frame.get('transform', 'rotate')) + beforeDelta;

    this.frame.set('transform', 'rotate', `${deg}deg`);
    this.setTransform(target);
    if (!isPinch) {
      this.setLabel(clientX, clientY, `R: ${deg.toFixed(1)}`);
    }
    this.obstacleObject[this.svgId].rotate = deg;
  }

  onResize({ target, clientX, clientY, width, height, isPinch }: OnResize) {
    this.frame.set('width', `${width}px`);
    this.frame.set('height', `${height}px`);
    this.setTransform(target);
    if (!isPinch) {
      this.setLabel(clientX, clientY, `W: ${width}px<br/>H: ${height}px`);
    }
  }

  onWarp({ target, clientX, clientY, delta, multiply }: OnWarp) {
    this.frame.set(
      'transform',
      'matrix3d',
      multiply(this.frame.get('transform', 'matrix3d'), delta)
    );
    this.setTransform(target);
    this.setLabel(clientX, clientY, `X: ${clientX}px<br/>Y: ${clientY}px`);
  }

  onEnd() {
    this.label.nativeElement.style.display = 'none';
    // this.target.style.left = this.frame.get('left');
    // this.target.style.top = this.frame.get('top')
  }

  moveableDestroy() {
    this.moveable.destroy();
  }

  arrowUpDown(event, type) {
    const target = event.target;
    if (target.innerHTML === 'keyboard_arrow_down') {
      target.innerHTML = 'keyboard_arrow_up';
      this.subitemClass[type] = 'subitem active';
    } else {
      target.innerHTML = 'keyboard_arrow_down';
      this.subitemClass[type] = 'subitem';
    }
  }

  /**
   * 開始運算
   */
  calculate() {
    if (typeof this.calculateForm.isAvgThroughput === 'undefined') {
      this.calculateForm.isAvgThroughput = false;
    }
    console.log(this.calculateForm);
  }


}

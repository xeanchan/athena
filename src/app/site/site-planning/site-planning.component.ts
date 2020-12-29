import { Component, OnInit, HostListener, ViewChild, ElementRef, AfterViewInit, OnDestroy, Input, TemplateRef } from '@angular/core';
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
import { MatMenuTrigger } from '@angular/material/menu';
import html2canvas from 'html2canvas';
import { AuthService } from '../../service/auth.service';
import { NgxSpinnerService } from 'ngx-spinner';

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
    private authService: AuthService,
    private router: Router,
    private matDialog: MatDialog,
    public spinner: NgxSpinnerService,
    private http: HttpClient) { }

  @ViewChild('moveable') moveable: NgxMoveableComponent;
  // @ViewChildren(TemplateRef) templateList: QueryList<TemplateRef<any>>;
  @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger: MatMenuTrigger;

  target;
  scalable = false;
  resizable = true;
  warpable = false;
  frame = new Frame({
    width: '50px',
    height: '50px',
    left: '0px',
    top: '0px',
    transform: {
      rotate: '0deg',
      scaleX: 1,
      scaleY: 1,
      // matrix3d: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
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
  zValues = ['50', '', ''];
  /** 障礙物 */
  obstacleList = [];
  dragObject = {};
  /** 現有基站 */
  defaultBSList = [];
  /** 新增基站 */
  newBSList = [];
  /** 新增ＵＥ */
  ueList = [];
  // 比例尺公式
  xLinear;
  yLinear;
  // chart邊界
  chartLeft = 0;
  chartRight = 0;
  chartTop = 0;
  chartBottom = 0;
  svgMap = {
    svg_01: {
      id: 'svg_1',
      title: '障礙物',
      type: 'obstacle',
      element: 'rect'
    },
    svg_02: {
      id: 'svg_2',
      title: '障礙物',
      type: 'obstacle',
      element: 'ellipse'
    },
    svg_03: {
      id: 'svg_3',
      title: '障礙物',
      type: 'obstacle',
      element: 'polygon'
    },
    svg_04: {
      id: 'svg_4',
      title: '現有基站',
      type: 'defaultBS',
      element: ''
    },
    svg_05: {
      id: 'svg_5',
      title: '新增基站',
      type: 'newBS',
      element: ''
    },
    svg_06: {
      id: 'svg_6',
      title: '新增ＵＥ',
      type: 'UE',
      element: ''
    }
  };
  // select svg id
  svgId;
  scalex;
  scaley;
  tooltipStr = '';
  // round
  roundFormat = Plotly.d3.format('.1f');
  // 預設無線模型 list
  pathLossModelIdList = [];
  // bounds = {
  //   left: 150,
  //   top: 0,
  //   right: 300,
  //   bottom: 500
  // };

  // we create an object that contains coordinates
  menuTopLeftPosition =  {x: '0', y: '0'};
  public color;
  // mouseover target
  hoverObj;
  // show image file name
  showFileName = true;
  circleStyle = {};
  // number column list
  numColumnList = ['totalRound', 'crossover', 'mutation', 'iteration', 'seed',
    'width', 'height', 'altitude', 'pathLossModelId', 'useUeCoordinate',
    'powerMaxRange', 'powerMinRange', 'beamMaxId', 'beamMinId', 'objectiveIndex',
    'availableNewBsNumber', 'addFixedBsNumber', 'bandwidth', 'Frequency', 'sinrRatio',
    'throughputRatio', 'coverageRatio', 'ueAvgSinrRatio', 'ueAvgThroughputRatio', 'ueTpByDistanceRatio',
    'mctsC', 'mctsMimo',
    'mctsTemperature', 'mctsTime', 'mctsTestTime', 'mctsTotalTime'];
    // 'distanceFactor', 'contantFactor',
  @Input() public bounds!: { left?: 10, top?: 20, right?: 70, bottom?: 50 };
  // task id
  taskid;
  // progress interval
  progressInterval;
  heightList = [];

  @ViewChild('msgLabel') label: ElementRef;
  @ViewChild('tooltip') tooltip: MatTooltip;
  @ViewChild('chart') chart: ElementRef;
  @ViewChild('materialModal') materialModal: TemplateRef<any>;

  @HostListener('document:click', ['$event'])
  clickout(event) {
    if (typeof this.target !== 'undefined') {
      if (this.target.contains(event.target)) {
        this.live = true;
      } else {
        this.live = false;
        try {
          this.moveable.destroy();
        } catch (error) {
          this.moveable.ngOnInit();
          this.moveable.destroy();
        }
      }
    }
  }

  /** delete keyCode 刪除物件 */
  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (typeof this.target !== 'undefined') {
      if (this.live) {
        if (event.key === 'Delete') {
          this.live = false;
          this.moveable.destroy();
          const id = this.target.closest('span').id;
          const obj = this.dragObject[id];
          if (obj.type === 'obstacle') {
            this.obstacleList.splice(this.obstacleList.indexOf(id), 1);
          } else if (obj.type === 'defaultBS') {
            this.defaultBSList.splice(this.defaultBSList.indexOf(id), 1);
          } else if (obj.type === 'newBS') {
            this.newBSList.splice(this.newBSList.indexOf(id), 1);
          } else if (obj.type === 'UE') {
            this.ueList.splice(this.ueList.indexOf(id), 1);
          }
        }
      }
    }
  }

  ngOnInit() {
    for (let i = 0; i < 9; i++) {
      this.pathLossModelIdList.push(i);
    }
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

  /** moveable init */
  moveClick(event, typeName) {
    try {
      this.moveable.destroy();
    } catch (error) {}
    // delete keycode生效
    window.setTimeout(() => {
      this.live = true;
    }, 0);

    if (event.target.closest('span').querySelector('.drag_rect') == null) {
      let svg = event.target;
      if (event.target.tagName !== 'svg') {
        svg = event.target.closest('svg');
      }
      this.svgId = svg.id;
      const titleName = this.svgMap[this.svgId].title;
      // element形狀
      let shape = '';
      if (this.svgMap[this.svgId].type === 'obstacle') {
        shape = this.svgMap[this.svgId].element;
        this.svgId = `${this.svgId}_${this.obstacleList.length}`;
        this.obstacleList.push(this.svgId);
      } else if (this.svgMap[this.svgId].type === 'defaultBS') {
        this.svgId = `${this.svgId}_${this.defaultBSList.length}`;
        this.defaultBSList.push(this.svgId);
      } else if (this.svgMap[this.svgId].type === 'newBS') {
        this.svgId = `${this.svgId}_${this.newBSList.length}`;
        this.newBSList.push(this.svgId);
      } else if (this.svgMap[this.svgId].type === 'UE') {
        this.svgId = `${this.svgId}_${this.ueList.length}`;
        this.ueList.push(this.svgId);
      }

      this.dragObject[this.svgId] = {
        x: 0,
        y: 0,
        z: this.zValues[0],
        width: 0,
        height: 0,
        altitude: 50,
        rotate: 0,
        title: titleName,
        type: typeName,
        color: 'green',
        material: '1',
        element: shape
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
          // matrix3d: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
        }
      });

      window.setTimeout(() => {

        const span = document.querySelectorAll(`.${typeName}`);
        const rect = svg.querySelector('.target');
        rect.setAttribute('fill', this.dragObject[this.svgId].color);
        rect.setAttribute('class', 'drag_rect');
        span[span.length - 1].innerHTML += svg.outerHTML;

        this.target = span[span.length - 1];
        this.target.bounds = this.bounds;
        this.target.dragArea = document.getElementById('chart');

        // 還原來源顏色 & class
        if (event.target.tagName !== 'svg') {
          event.target.setAttribute('fill', '#ffffff');
          event.target.setAttribute('class', 'target');
        } else {
          event.target.querySelector('.drag_rect').setAttribute('fill', '#ffffff');
          event.target.querySelector('.drag_rect').setAttribute('class', 'target');
        }

        if (typeName === 'obstacle') {
          this.moveable.rotatable = true;
          this.moveable.resizable = true;
        } else {
          this.moveable.rotatable = false;
          this.moveable.resizable = false;
        }
        this.moveable.ngOnInit();
        this.setDragData();
        this.tooltip.show();
        this.moveNumber();

      }, 0);
    } else {

      this.target = event.target.closest('span');
      this.svgId = this.target.id;

      if (typeName === 'obstacle') {
        this.moveable.rotatable = true;
        this.moveable.resizable = true;
      } else {
        this.moveable.rotatable = false;
        this.moveable.resizable = false;
      }
      this.moveable.ngOnInit();
      this.setDragData();
      this.tooltip.show();
    }
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

  /** mat-tooltip 文字 */
  getTooltip() {
    if (typeof this.hoverObj !== 'undefined') {
      const span = this.hoverObj.closest('span');
      const id = span.id;
      const rect = span.getBoundingClientRect();
      const rectLeft = rect.left - this.chartLeft;
      const rectBottom = this.chartBottom - rect.bottom;
      let xVal = this.roundFormat(this.xLinear(rectLeft));
      if (xVal < 0) {
        xVal = 0;
      }
      const yVal = this.roundFormat(this.yLinear(rectBottom));
      const wVal = this.roundFormat(this.xLinear(rect.width));
      const hVal = this.roundFormat(this.yLinear(rect.height));
      let title = `${this.dragObject[id].title}
        X: ${xVal}
        Y: ${yVal}\n`;
      if (this.dragObject[id].type === 'obstacle') {
        title += `長: ${wVal}
        寬: ${hVal}\n`;
      }
      title += `高: ${this.dragObject[id].altitude}\n`;
      if (this.dragObject[id].type === 'obstacle') {
        title += `材質: ${this.parseMaterial(this.dragObject[id].material)}`;
      }
      return title;

    } else {
      return '';
    }
  }

  /** set drag object data */
  setDragData() {
    const span = this.target.closest('span');
    const rect = span.getBoundingClientRect();
    const rectLeft = rect.left - this.chartLeft;
    const rectBottom = this.chartBottom - rect.bottom;
    let xVal = this.roundFormat(this.xLinear(rectLeft));
    if (xVal < 0) {
      xVal = 0;
    }
    const yVal = this.roundFormat(this.yLinear(rectBottom));
    const wVal = this.roundFormat(this.xLinear(rect.width));
    const hVal = this.roundFormat(this.yLinear(rect.height));
    this.dragObject[this.svgId].x = xVal;
    this.dragObject[this.svgId].y = yVal;
    this.dragObject[this.svgId].width = wVal;
    this.dragObject[this.svgId].height = hVal;
  }

  parseMaterial(val) {
    if (val === '1') {
      return '木頭';
    } else if (val === '2') {
      return '水泥';
    } else if (val === '3') {
      return '輕鋼架';
    } else if (val === '4') {
      return '玻璃';
    }
  }

  dragStart(moveable: MoveableGroupInterface<BeforeRenderableProps>, e: any) {
    e.bounds = this.bounds;
  }

  /** drag */
  onDrag({ target, clientX, clientY, top, left, isPinch }: OnDrag) {

    const rect = target.getBoundingClientRect();
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
    this.setDragData();
    if (this.dragObject[this.svgId].type === 'defaultBS' || this.dragObject[this.svgId].type === 'newBS') {
      this.moveNumber();
    }
  }

  /** 縮放 */
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
    if (this.dragObject[this.svgId].type === 'defaultBS' || this.dragObject[this.svgId].type === 'newBS') {
      this.moveNumber();
    }
  }

  /** 旋轉角度 */
  onRotate({ target, clientX, clientY, beforeDelta, isPinch }: OnRotate) {
    const deg = parseFloat(this.frame.get('transform', 'rotate')) + beforeDelta;

    this.frame.set('transform', 'rotate', `${deg}deg`);
    this.setTransform(target);
    if (!isPinch) {
      this.setLabel(clientX, clientY, `R: ${deg.toFixed(1)}`);
    }
    this.dragObject[this.svgId].rotate = Math.ceil(deg);
  }

  /** 縮放 */
  onResize({ target, clientX, clientY, width, height, isPinch }: OnResize) {
    this.frame.set('width', `${width}px`);
    this.frame.set('height', `${height}px`);
    this.setTransform(target);
    if (!isPinch) {
      this.setLabel(clientX, clientY, `W: ${width}px<br/>H: ${height}px`);
    }
    const svg = target.querySelector('svg');
    svg.setAttribute('width', width.toString());
    svg.setAttribute('height', height.toString());
    const dragRect = svg.querySelector('.drag_rect');
    const type = this.dragObject[this.svgId].element;
    if (type === 'rect') {
      // 方形
      dragRect.setAttribute('width', width.toString());
      dragRect.setAttribute('height', height.toString());
    } else if (type === 'ellipse') {
      // 圓形
      const val = (Plotly.d3.min([width, height]) / 2).toString();
      dragRect.setAttribute('rx', width.toString());
      dragRect.setAttribute('ry', height.toString());
      dragRect.setAttribute('cx', width.toString());
      dragRect.setAttribute('cy', height.toString());
    } else if (type === 'polygon') {
      // 三角形
      const points = `${width / 2},0 ${width}, ${height} 0, ${height}`;
      dragRect.setAttribute('points', points);
    }
    this.setDragData();
    if (this.dragObject[this.svgId].type === 'defaultBS' || this.dragObject[this.svgId].type === 'newBS') {
      this.moveNumber();
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
  }

  moveableDestroy() {
    this.moveable.destroy();
  }

  /** 右邊選單開合切換 */
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

  /** 右鍵選單 */
  onRightClick(event: MouseEvent, svgId) {
    this.svgId = svgId;
    // preventDefault avoids to show the visualization of the right-click menu of the browser
    event.preventDefault();
    // we record the mouse position in our object
    this.menuTopLeftPosition.x = event.clientX + 'px';
    this.menuTopLeftPosition.y = event.clientY + 'px';
    // we open the menu
    this.matMenuTrigger.openMenu();
  }

  /** delete */
  delete() {
    if (this.dragObject[this.svgId].type === 'obstacle') {
      for (let i = this.obstacleList.length - 1; i >= 0; i--) {
        if (this.obstacleList[i] === this.svgId) {
          this.obstacleList.splice(i, 1);
        }
      }
    } else if (this.dragObject[this.svgId].type === 'defaultBS') {
      for (let i = this.defaultBSList.length - 1; i >= 0; i--) {
        if (this.defaultBSList[i] === this.svgId) {
          this.defaultBSList.splice(i, 1);
        }
      }
    } else if (this.dragObject[this.svgId].type === 'newBS') {
      for (let i = this.newBSList.length - 1; i >= 0; i--) {
        if (this.newBSList[i] === this.svgId) {
          this.newBSList.splice(i, 1);
        }
      }
    } else if (this.dragObject[this.svgId].type === 'UE') {
      for (let i = this.ueList.length - 1; i >= 0; i--) {
        if (this.ueList[i] === this.svgId) {
          this.ueList.splice(i, 1);
        }
      }
    }
  }

  /** change color */
  colorChange() {
    this.dragObject[this.svgId].color = this.color;
    document.querySelector(`#${this.svgId}`)
    .querySelector('.drag_rect').setAttribute('fill', this.color);
  }

  openHeightSetting() {
    this.matDialog.open(this.materialModal);
  }

  /** 變更材質 */
  materialChange(val) {
    this.dragObject[this.svgId].material = val;
  }

  /** get mat-tooltip object */
  hover(event) {
    this.hoverObj = event.target;
  }

  /** file change */
  fileChange(event) {
    const file = event.target.files[0];
    this.calculateForm.mapName = file.name;
    this.showFileName = false;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.calculateForm.mapImage = reader.result.toString();
      this.initData();
    };
  }

  /** 數量物件移動 */
  moveNumber() {
    const circleElement: HTMLSpanElement = document.querySelector(`#${this.svgId}_circle`);
    if (circleElement != null) {
      const targetElement: HTMLSpanElement = document.querySelector(`#${this.svgId}`);
      const targetRect = targetElement.getBoundingClientRect();
      circleElement.style.top = `${targetRect.top - 20}px`;
      circleElement.style.left = `${targetRect.left + targetRect.width - 10}px`;
    }
  }

  setCheckbox(val) {
    if (val !== '') {
      return true;
    } else {
      return false;
    }
  }

  /**
   * 開始運算
   */
  calculate() {
    try {
      this.moveable.destroy();
    } catch (error) {}

    this.spinner.show();
    if (typeof this.calculateForm.isAverageSinr === 'undefined') {
      this.calculateForm.isAverageSinr = false;
    }
    if (typeof this.calculateForm.isAvgThroughput === 'undefined') {
      this.calculateForm.isAvgThroughput = false;
    }
    if (typeof this.calculateForm.isCoverage === 'undefined') {
      this.calculateForm.isCoverage = false;
    }
    if (typeof this.calculateForm.isUeAvgSinr === 'undefined') {
      this.calculateForm.isUeAvgSinr = false;
    }
    if (typeof this.calculateForm.isUeAvgThroughput === 'undefined') {
      this.calculateForm.isUeAvgThroughput = false;
    }
    if (typeof this.calculateForm.isUeTpByDistance === 'undefined') {
      this.calculateForm.isUeTpByDistance = false;
    }
    this.calculateForm.sessionid = this.authService.userToken;

    html2canvas(this.chart.nativeElement).then(canvas => {
      const src = canvas.toDataURL();
      // 組form
      this.calculateForm.mapImage = src;
      const zValue = this.zValues.filter(
        option => option !== ''
      );
      this.calculateForm.zValue = `[${zValue.toString()}]`;
      this.calculateForm.availableNewBsNumber = this.newBSList.length;
      if (this.obstacleList.length > 0) {
        // 障礙物資訊
        let obstacleInfo = '';
        for (let i = 0; i < this.obstacleList.length; i++) {
          const obj = this.dragObject[this.obstacleList[i]];
          obstacleInfo += `[${obj.x},${obj.y},${obj.width},${obj.height},${obj.altitude},${obj.rotate}]`;
          if (i < this.obstacleList.length - 1) {
            obstacleInfo += '|';
          }
        }
        this.calculateForm.obstacleInfo = obstacleInfo;
      }
      if (this.ueList.length > 0) {
        // UE設定
        let ueCoordinate = '';
        for (let i = 0; i < this.ueList.length; i++) {
          const obj = this.dragObject[this.ueList[i]];
          ueCoordinate += `[${obj.x},${obj.y},${obj.z}]`;
          if (i < this.ueList.length - 1) {
            ueCoordinate += '|';
          }
        }
        this.calculateForm.ueCoordinate = ueCoordinate;
      }
      if (this.defaultBSList.length > 0) {
        // 現有基站
        let defaultBs = '';
        for (let i = 0; i < this.defaultBSList.length; i++) {
          const obj = this.dragObject[this.defaultBSList[i]];
          defaultBs += `[${obj.x},${obj.y},${obj.z}]`;
          if (i < this.defaultBSList.length - 1) {
            defaultBs += '|';
          }
        }
        this.calculateForm.defaultBs = defaultBs;
      }
      if (this.newBSList.length > 0) {
        // 新增基站
        let newBs = '';
        for (let i = 0; i < this.newBSList.length; i++) {
          const obj = this.dragObject[this.newBSList[i]];
          newBs += `[${obj.x},${obj.y},${obj.z}]`;
          if (i < this.newBSList.length - 1) {
            newBs += '|';
          }
        }
        this.calculateForm.candidateBs = newBs;
      }
      this.calculateForm.availableNewBsNumber = this.newBSList.length;

      // number type to number
      Object.keys(this.calculateForm).forEach((key) => {
        if (this.numColumnList.includes(key)) {
          console.log('tonumber = ' + key)
          this.calculateForm[key] = Number(this.calculateForm[key]);
        }
      });

      const url = `${this.authService.API_URL}/calculate`;
      this.http.post(url, JSON.stringify(this.calculateForm)).subscribe(
        res => {
          this.taskid = res['taskid'];
          this.getProgress();
        },
        err => {
          this.spinner.hide();
          console.log(err);
        }
      );


      console.log(this.calculateForm);
    });
  }

  /** 查詢進度 */
  getProgress() {
    const url = `${this.authService.API_URL}/progress/${this.taskid}/${this.authService.userToken}`;
    this.http.get(url).subscribe(
      res => {
        window.clearInterval(this.progressInterval);
        if (res['progress'] === 1) {
          // done
          this.spinner.hide();
          this.router.navigate([`/site/result`], { queryParams: { taskId: this.taskid }});
        } else {
          // query again
          window.clearInterval(this.progressInterval);
          this.progressInterval = window.setTimeout(() => {
            this.getProgress();
          }, 5000);
        }

      }, err => {
        this.spinner.hide();
        window.clearInterval(this.progressInterval);
      }
    );
  }


}

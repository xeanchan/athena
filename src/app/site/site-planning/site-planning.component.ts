import { Component, OnInit, HostListener, ViewChild, ElementRef, AfterViewInit, OnDestroy, Input, TemplateRef, OnChanges } from '@angular/core';
import { OnPinch, OnScale, OnDrag, OnRotate, OnResize, OnWarp, MoveableGroupInterface, BeforeRenderableProps } from 'moveable';
import { Frame } from 'scenejs';
import { NgxMoveableComponent } from 'ngx-moveable';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { CalculateForm } from '../../form/CalculateForm';
import * as _ from 'lodash';
import { MatMenuTrigger } from '@angular/material/menu';
import html2canvas from 'html2canvas';
import { AuthService } from '../../service/auth.service';
import { View3dComponent } from '../view3d/view3d.component';
import * as XLSX from 'xlsx';
import { MsgDialogComponent } from '../../utility/msg-dialog/msg-dialog.component';

declare var Plotly: any;

interface PlotHTMLElement extends HTMLElement {
  on(eventName: string, handler: any): void;
}

@Component({
  selector: 'app-site-planning',
  templateUrl: './site-planning.component.html',
  styleUrls: ['./site-planning.component.scss']
})
export class SitePlanningComponent implements OnInit, AfterViewInit, OnDestroy {

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private matDialog: MatDialog,
    private http: HttpClient) {
    }

  @ViewChild('moveable') moveable: NgxMoveableComponent;
  // @ViewChildren(TemplateRef) templateList: QueryList<TemplateRef<any>>;
  @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger: MatMenuTrigger;

  target;
  scalable = false;
  resizable = true;
  warpable = false;
  frame = new Frame({
    width: '30px',
    height: '30px',
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
  candidateList = [];
  /** 新增ＵＥ */
  ueList = [];
  // 比例尺公式
  xLinear;
  yLinear;
  pixelXLinear;
  pixelYLinear;
  // chart邊界
  chartLeft = 0;
  chartRight = 0;
  chartTop = 0;
  chartBottom = 0;
  chartHeight = 0;
  svgMap = {
    rect: {
      id: 'svg_1',
      title: '障礙物',
      type: 'obstacle',
      element: 'rect'
    },
    ellipse: {
      id: 'svg_2',
      title: '障礙物',
      type: 'obstacle',
      element: 'ellipse'
    },
    polygon: {
      id: 'svg_3',
      title: '障礙物',
      type: 'obstacle',
      element: 'polygon'
    },
    defaultBS: {
      id: 'svg_4',
      title: '現有基站',
      type: 'defaultBS',
      element: ''
    },
    candidate: {
      id: 'svg_5',
      title: '新增基站',
      type: 'candidate',
      element: ''
    },
    UE: {
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
  bounds = {
    left: 0,
    top: 0,
    right: 400,
    bottom: 500
  };

  // we create an object that contains coordinates
  menuTopLeftStyle = {top: '0', left: '0'};
  public color;
  // mouseover target
  hoverObj;
  // show image file name
  showFileName = true;
  // number column list
  numColumnList = ['totalRound', 'crossover', 'mutation', 'iteration', 'seed',
    'width', 'height', 'altitude', 'pathLossModelId', 'useUeCoordinate',
    'powerMaxRange', 'powerMinRange', 'beamMaxId', 'beamMinId', 'objectiveIndex',
    'availableNewBsNumber', 'addFixedBsNumber', 'bandwidth', 'frequency', 'sinrRatio',
    'throughputRatio', 'coverageRatio', 'ueAvgSinrRatio', 'ueAvgThroughputRatio', 'ueTpByDistanceRatio',
    'mctsC', 'mctsMimo', 'ueCoverageRatio', 'ueTpByRsrpRatio',
    'mctsTemperature', 'mctsTime', 'mctsTestTime', 'mctsTotalTime'];
    // 'distanceFactor', 'contantFactor',
  // @Input() public bounds!: { left?: 10, top?: 20, right?: 70, bottom?: 50 };
  // task id
  taskid = '';
  // progress interval
  progressInterval;
  heightList = [];
  plotLayout;
  view3dDialogConfig: MatDialogConfig = new MatDialogConfig();
  msgDialogConfig: MatDialogConfig = new MatDialogConfig();
  // tooltip
  tooltipStyle = {
    left: '0px',
    top: '0px'
  };
  spanStyle = {};
  rectStyle = {};
  ellipseStyle = {};
  polygonStyle = {};
  svgStyle = {};
  pathStyle = {};
  circleStyle = {};
  /** workbook */
  wb: XLSX.WorkBook;
  dragStyle = {};

  @ViewChild('chart') chart: ElementRef;
  @ViewChild('materialModal') materialModal: TemplateRef<any>;

  @HostListener('window:resize') windowResize() {
    // this.plotResize();
  }

  @HostListener('document:click', ['$event'])
  clickout(event) {
    if (typeof this.target !== 'undefined' && this.target != null) {
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
          } else if (obj.type === 'candidate') {
            this.candidateList.splice(this.candidateList.indexOf(id), 1);
          } else if (obj.type === 'UE') {
            this.ueList.splice(this.ueList.indexOf(id), 1);
          }
        }
      }
    }
  }

  ngOnInit() {
    this.view3dDialogConfig.autoFocus = false;
    this.view3dDialogConfig.width = '80%';
    this.msgDialogConfig.autoFocus = false;

    for (let i = 0; i < 9; i++) {
      this.pathLossModelIdList.push(i);
    }

    this.route.queryParams.subscribe(params => {
      if (typeof params['taskId'] !== 'undefined') {
        this.taskid = params['taskId'];
      }
    });

    if (sessionStorage.getItem('importFile') != null) {
      // from new-planning import file
      this.calculateForm = new CalculateForm();
      this.calculateForm.taskName = sessionStorage.getItem('taskName');
      const reader = new FileReader();
      reader.onload = (e) => {
        this.readXls(e.target.result);
      };
      reader.readAsBinaryString(this.dataURLtoBlob(sessionStorage.getItem('importFile')));

    } else {
      if (this.taskid !== '') {
        // 編輯
        const url = `${this.authService.API_URL}/completeCalcResult/${this.taskid}/${this.authService.userToken}`;
        this.http.get(url).subscribe(
          res => {
            this.calculateForm = res['input'];
            this.initData(false);
          },
          err => {
            this.msgDialogConfig.data = {
              type: 'error',
              infoMessage: '無法取得計算結果!'
            };
            this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
          }
        );
      } else {
        // from new-planning upload image
        this.calculateForm = JSON.parse(sessionStorage.getItem('calculateForm'));
        this.initData(false);
      }
    }
  }

  ngOnDestroy(): void {
    if (typeof this.progressInterval !== 'undefined') {
      window.clearInterval(this.progressInterval);
    }
    try {
      this.moveable.destroy();
    } catch (error) {}
  }

  ngAfterViewInit(): void {
    // this.tools = _.cloneDeep(document.querySelector('.tool').innerHTML);
    // this.moveable.destroy();
  }

  /**
   * init data
   */
  initData(isImport) {
    // if (this.calculateForm.mapImage != null) {
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

        Plotly.newPlot('chart', {
          data: [],
          layout: this.plotLayout,
          config: defaultPlotlyConfiguration
        }).then((gd) => {
          const xy: SVGRectElement = gd.querySelector('.xy').querySelectorAll('rect')[0];
          const rect = xy.getBoundingClientRect();

          const image = new Image();
          image.src = reader.result.toString();
          image.onload = () => {
            const height = (image.height / (image.width * 0.9)) * rect.width;

            Plotly.relayout('chart', {
              height: height
            }).then((gd2) => {
              const xy2: SVGRectElement = gd2.querySelector('.xy').querySelectorAll('rect')[0];
              const rect2 = xy2.getBoundingClientRect();
              // drag範圍
              this.bounds = {
                left: rect2.left,
                top: rect2.top,
                right: rect2.right,
                bottom: rect2.top + rect2.height
              };

              // 計算比例尺
              this.calScale(gd2);
              // import xlsx
              if (isImport) {
                this.setImportData();
              } else if (this.taskid !== '') {
                // 編輯
                this.edit();
              } else {
                this.edit();
              }
            });
          };
        });
      };
    // }
  }

  /** 計算比例尺 */
  calScale(gd) {
    const xy: SVGRectElement = gd.querySelector('.xy').querySelectorAll('rect')[0];
    const rect = xy.getBoundingClientRect();
    this.chartLeft = rect.left;
    this.chartRight = rect.right;
    this.chartTop = rect.top;
    this.chartBottom = rect.bottom;
    this.chartHeight = rect.height;

    this.dragStyle = {
      left: `${xy.getAttribute('x')}px`,
      top: `${xy.getAttribute('y')}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      position: 'absolute'
    };

    this.xLinear = Plotly.d3.scale.linear()
      .domain([0, rect.width])
      .range([0, this.calculateForm.width]);

    this.yLinear = Plotly.d3.scale.linear()
      .domain([0, rect.height])
      .range([0, this.calculateForm.height]);

    this.pixelXLinear = Plotly.d3.scale.linear()
      .domain([0, this.calculateForm.width])
      .range([0, rect.width]);

    this.pixelYLinear = Plotly.d3.scale.linear()
      .domain([0, this.calculateForm.height])
      .range([0, rect.height]);

  }

  /**
   * dataURI to blob
   * @param dataURI
   */
  dataURLtoBlob(dataURI) {
    let byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0) {
      byteString = atob(dataURI.split(',')[1]); // atob(dataURI.split(',')[1]);
      // decodeURIComponent(escape(window.atob(("eyJzdWIiOiJ0ZXN0MyIsInVzZXJJZCI6IjEwMTY5MiIsIm5hbWUiOiLmtYvor5V0ZXN0M-a1i-ivlSIsImV4cCI6MTU3OTUxMTY0OH0").replace(/-/g, "+").replace(/_/g, "/"))));
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

  /** add moveable */
  addMoveable(id) {
    try {
      this.moveable.destroy();
    } catch (error) {}
    // delete keycode生效
    window.setTimeout(() => {
      this.live = true;
    }, 0);

    if (id === 'rect') {
      this.svgId = `${id}_${this.obstacleList.length}`;
      this.obstacleList.push(this.svgId);
      this.rectStyle[this.svgId] = {
        width: 30,
        height: 30,
        fill: '#73805c'
      };
    } else if (id === 'ellipse') {
      this.svgId = `${id}_${this.obstacleList.length}`;
      this.obstacleList.push(this.svgId);
      this.ellipseStyle[this.svgId] = {
        ry: 15,
        rx: 15,
        cx: 15,
        cy: 15,
        fill: '#73805c'
      };
    } else if (id === 'polygon') {
      this.svgId = `${id}_${this.obstacleList.length}`;
      this.obstacleList.push(this.svgId);
      this.polygonStyle[this.svgId] = {
        points: '15,0 30,30 0,30',
        fill: '#73805c'
      };
    } else if (id === 'defaultBS') {
      this.svgId = `${id}_${this.defaultBSList.length}`;
      this.defaultBSList.push(this.svgId);
      this.pathStyle[this.svgId] = {
        fill: '#2958be'
      };
    } else if (id === 'candidate') {
      this.svgId = `${id}_${this.candidateList.length}`;
      this.candidateList.push(this.svgId);
      this.pathStyle[this.svgId] = {
        fill: '#d00a67'
      };
    } else if (id === 'UE') {
      this.svgId = `${id}_${this.ueList.length}`;
      this.ueList.push(this.svgId);
      this.pathStyle[this.svgId] = {
        fill: '#6abdd4'
      };
    }
    this.spanStyle[this.svgId] = {
      left: `200px`,
      top: `100px`,
      width: `30px`,
      height: `30px`
    };
    this.svgStyle[this.svgId] = {
      display: 'inherit',
      width: 30,
      height: 30
    };

    this.dragObject[this.svgId] = {
      x: 0,
      y: 0,
      z: this.zValues[0],
      width: 30,
      height: 30,
      altitude: 50,
      rotate: 0,
      title: this.svgMap[id].title,
      type: this.svgMap[id].type,
      color: 'green',
      material: '0',
      element: id
    };

    this.frame = new Frame({
      width: '30px',
      height: '30px',
      left: '200px',
      top: '100px',
      'z-index': 99999,
      transform: {
        rotate: '0deg',
        scaleX: 1,
        scaleY: 1
      }
    });

    window.setTimeout(() => {
      this.target = document.getElementById(`${this.svgId}`);
      this.live = true;
      if (this.svgMap[id].type === 'obstacle') {
        this.moveable.rotatable = true;
        this.moveable.resizable = true;
      } else {
        this.moveable.rotatable = false;
        this.moveable.resizable = false;
      }
      this.moveable.ngOnInit();
      this.setDragData();
      this.moveNumber(this.svgId);
      this.hoverObj = this.target;
      this.setLabel();
    }, 0);
  }

  /** moveable init */
  moveClick(id) {
    try {
      this.moveable.destroy();
    } catch (error) {}
    // delete keycode生效
    window.setTimeout(() => {
      this.live = true;
    }, 0);
    this.target = document.getElementById(id);
    this.svgId = id;
    this.frame = new Frame({
      width: this.svgStyle[id].width,
      height: this.svgStyle[id].height,
      left: this.svgStyle[id].left,
      top: this.svgStyle[id].top,
      'z-index': 99999,
      transform: {
        rotate: `${this.dragObject[this.svgId].rotate}deg`,
        scaleX: 1,
        scaleY: 1
      }
    });

    this.live = true;
    if (this.dragObject[id].type === 'obstacle') {
      this.moveable.rotatable = true;
      this.moveable.resizable = true;
    } else {
      this.moveable.rotatable = false;
      this.moveable.resizable = false;
    }

    this.moveable.ngOnInit();
    this.setDragData();
    this.hoverObj = this.target;
    this.setLabel();
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

  /** set tooltip position */
  setLabel() {
    this.live = true;
    window.setTimeout(() => {
      const obj = this.hoverObj.getBoundingClientRect();
      this.tooltipStyle.left = `${obj.left}px`;
      this.tooltipStyle.top = `${obj.top + obj.height + 5}px`;
      this.tooltipStr = this.getTooltip();
    }, 0);
  }

  /** tooltip 文字 */
  getTooltip() {
    const id = this.hoverObj.id;
    let title = `${this.dragObject[id].title}<br>`;
    title += `X: ${this.dragObject[id].x}<br>`;
    title += `Y: ${this.dragObject[id].y}<br>`;
    if (this.dragObject[id].type === 'obstacle') {
      title += `長: ${this.dragObject[id].width}<br>`;
      title += `寬: ${this.dragObject[id].height}<br>`;
    }
    title += `高: ${this.dragObject[id].altitude}<br>`;
    if (this.dragObject[id].type === 'obstacle') {
      title += `材質: ${this.parseMaterial(this.dragObject[id].material)}`;
    }
    return title;
  }

  /** set drag object data */
  setDragData() {
    // const span = this.target.closest('span');
    const rect = this.target.getBoundingClientRect();
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
    if (val === '0') {
      return '木頭';
    } else if (val === '1') {
      return '水泥';
    } else if (val === '2') {
      return '輕鋼架';
    } else if (val === '3') {
      return '玻璃';
    } else if (val === '4') {
      return '不鏽鋼/其它金屬類';
    }
  }

  dragStart(e: any) {
    // e.bounds = this.bounds;
  }

  /** drag */
  onDrag({ target, clientX, clientY, top, left, isPinch }: OnDrag) {

    this.target = target;
    const rect = target.getBoundingClientRect();
    const rectLeft = rect.left;
    const rectRight = rect.right;
    const rectTop = rect.top;
    const rectBottom = rect.bottom;

    this.frame.set('left', `${left}px`);
    this.frame.set('top', `${top}px`);
    this.setTransform(target);

    // if (rectLeft > this.chartLeft - 1 && rectRight < this.chartRight
    //   && rectTop > this.chartTop && rectBottom < this.chartBottom) {
    //   this.frame.set('left', `${left}px`);
    //   this.frame.set('top', `${top}px`);
    //   this.setTransform(target);

    // } else {
    //   if (rectLeft < this.chartLeft) {
    //     console.log(this.chartLeft)
    //     this.frame.set('left', `${this.chartLeft}px`);
    //     this.setTransform(target);
    //     this.spanStyle[this.svgId].left = `${this.chartLeft}px`;
    //   } else if (rectTop <= this.chartTop) {
    //     this.frame.set('top', `${this.chartTop + 1}px`);
    //     this.setTransform(target);
    //     const t = Number(target.closest('span').style.top.replace('px', ''));
    //     target.closest('span').style.top = `${t + 1}px`;
    //   } else if (rectRight >= this.chartRight) {
    //     this.frame.set('left', `${rectLeft - 1}px`);
    //     this.setTransform(target);
    //     const t = Number(target.closest('span').style.left.replace('px', ''));
    //     target.closest('span').style.left = `${t - 1}px`;
    //   } else if (rectBottom >= this.chartBottom) {
    //     this.frame.set('top', `${rectTop - 1}px`);
    //     this.setTransform(target);
    //     const t = Number(target.closest('span').style.top.replace('px', ''));
    //     target.closest('span').style.top = `${t - 1}px`;
    //   }
    // }
    this.spanStyle[this.svgId].left = `${left}px`;
    this.spanStyle[this.svgId].top = `${top}px`;
    this.setDragData();
    if (this.dragObject[this.svgId].type === 'defaultBS' || this.dragObject[this.svgId].type === 'candidate') {
      this.moveNumber(this.svgId);
    }
    this.setLabel();
  }

  /** 縮放 */
  onScale({ target, delta, clientX, clientY, isPinch }: OnScale) {
    const scaleX = this.frame.get('transform', 'scaleX') * delta[0];
    const scaleY = this.frame.get('transform', 'scaleY') * delta[1];
    this.frame.set('transform', 'scaleX', scaleX);
    this.frame.set('transform', 'scaleY', scaleY);
    this.setTransform(target);
    if (!isPinch) {
      this.setLabel();
    }
    this.scalex = scaleX;
    if (this.dragObject[this.svgId].type === 'defaultBS' || this.dragObject[this.svgId].type === 'candidate') {
      this.moveNumber(this.svgId);
    }
  }

  /** 旋轉角度 */
  onRotate({ target, clientX, clientY, beforeDelta, isPinch }: OnRotate) {
    const deg = parseFloat(this.frame.get('transform', 'rotate')) + beforeDelta;
    this.frame.set('transform', 'rotate', `${deg}deg`);
    this.frame.set('left', this.spanStyle[this.svgId].left);
    this.frame.set('top', this.spanStyle[this.svgId].top);
    this.setTransform(target);
    this.dragObject[this.svgId].rotate = Math.ceil(deg);
    this.setLabel();
  }

  /** 縮放 */
  onResize({ target, clientX, clientY, width, height, isPinch }: OnResize) {
    if (width < 5) {
      width = 5;
    }
    if (height < 5) {
      height = 5;
    }
    this.frame.set('width', `${width}px`);
    this.frame.set('height', `${height}px`);
    this.frame.set('left', this.spanStyle[this.svgId].left);
    this.frame.set('top', this.spanStyle[this.svgId].top);
    this.setTransform(target);

    this.svgStyle[this.svgId].width = width;
    this.svgStyle[this.svgId].height = height;

    const type = this.dragObject[this.svgId].element;

    if (type === 'rect') {
      // 方形
      this.rectStyle[this.svgId].width = width;
      this.rectStyle[this.svgId].height = height;
      // dragRect.setAttribute('width', width.toString());
      // dragRect.setAttribute('height', height.toString());
    } else if (type === 'ellipse') {
      // 圓形
      const x = (width / 2).toString();
      const y = (height / 2).toString();
      this.ellipseStyle[this.svgId].rx = x;
      this.ellipseStyle[this.svgId].ry = y;
      this.ellipseStyle[this.svgId].cx = x;
      this.ellipseStyle[this.svgId].cy = y;
      // dragRect.setAttribute('rx', x);
      // dragRect.setAttribute('ry', y);
      // dragRect.setAttribute('cx', x);
      // dragRect.setAttribute('cy', y);
    } else if (type === 'polygon') {
      // 三角形
      const points = `${width / 2},0 ${width}, ${height} 0, ${height}`;
      this.polygonStyle[this.svgId].points = points;
      // dragRect.setAttribute('points', points);
    }
    this.setDragData();
    if (this.dragObject[this.svgId].type === 'defaultBS' || this.dragObject[this.svgId].type === 'candidate') {
      this.moveNumber(this.svgId);
    }
    this.setLabel();
  }

  onEnd() {
    this.live = false;
    if (this.spanStyle[this.svgId].left.replace('px', '') < this.chartLeft) {
      this.spanStyle[this.svgId].left = `${this.chartLeft}px`;
    }
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
    this.menuTopLeftStyle.left = event.clientX + 'px';
    this.menuTopLeftStyle.top = event.clientY + 'px';
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
    } else if (this.dragObject[this.svgId].type === 'candidate') {
      for (let i = this.candidateList.length - 1; i >= 0; i--) {
        if (this.candidateList[i] === this.svgId) {
          this.candidateList.splice(i, 1);
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
    if (this.dragObject[this.svgId].type === 'obstacle') {
      if (this.dragObject[this.svgId].element === 'rect') {
        this.rectStyle[this.svgId].fill = this.color;
      } else if (this.dragObject[this.svgId].element === 'ellipse') {
        this.ellipseStyle[this.svgId].fill = this.color;
      } else if (this.dragObject[this.svgId].element === 'polygon') {
        this.polygonStyle[this.svgId].fill = this.color;
      }
    } else {
      this.pathStyle[this.svgId].fill = this.color;
    }
  }

  openHeightSetting() {
    this.matDialog.open(this.materialModal);
  }

  /** 變更材質 */
  materialChange(val) {
    this.dragObject[this.svgId].material = val;
  }

  /** get mat-tooltip object */
  hover(event, svgId) {
    this.live = true;
    this.svgId = svgId;
    this.hoverObj = event.target.closest('span');
    this.setLabel();
  }

  hoverout(event) {
    this.live = false;
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
      this.initData(false);
    };
  }

  /** 數量物件移動 */
  moveNumber(svgId) {
    const circleElement: HTMLSpanElement = document.querySelector(`#${svgId}_circle`);
    if (circleElement != null) {
      const top = `${Number(this.spanStyle[svgId].top.replace('px', '')) - 20}px`;
      const width = Number(this.spanStyle[svgId].width.replace('px', ''));
      const left = Number(this.spanStyle[svgId].left.replace('px', ''));
      this.circleStyle[svgId] = {
        top: top,
        left: `${left + width - 10}px`
      };

      console.log(this.spanStyle[svgId], this.circleStyle[svgId])
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

    this.authService.spinnerShowAsHome();
    this.setForm();
    console.log(this.calculateForm);
    const url = `${this.authService.API_URL}/calculate`;
    this.http.post(url, JSON.stringify(this.calculateForm)).subscribe(
      res => {
        this.taskid = res['taskid'];
        document.getElementById('percentageVal').innerHTML = '0';
        this.getProgress();
      },
      err => {
        this.authService.spinnerHide();
        console.log(err);
      }
    );
  }

  /** 組form */
  setForm() {
    this.authService.spinnerShowAsHome();
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
    this.calculateForm.useUeCoordinate = 1;

    this.calculateForm.sessionid = this.authService.userToken;
    const zValue = this.zValues.filter(
      option => option !== ''
    );
    this.calculateForm.zValue = `[${zValue.toString()}]`;
    let obstacleInfo = '';
    this.calculateForm.obstacleInfo = obstacleInfo;
    if (this.obstacleList.length > 0) {
      // 障礙物資訊
      for (let i = 0; i < this.obstacleList.length; i++) {
        const obj = this.dragObject[this.obstacleList[i]];
        obstacleInfo += `[${obj.x},${obj.y},${obj.width},${obj.height},${obj.altitude},${obj.rotate},${obj.material}]`;
        if (i < this.obstacleList.length - 1) {
          obstacleInfo += '|';
        }
      }
      this.calculateForm.obstacleInfo = obstacleInfo;
    }
    let ueCoordinate = '';
    this.calculateForm.ueCoordinate = ueCoordinate;
    if (this.ueList.length > 0) {
      for (let i = 0; i < this.ueList.length; i++) {
        const obj = this.dragObject[this.ueList[i]];
        // ueCoordinate += `[${obj.x},${obj.y},${obj.z},${obj.material}]`;
        ueCoordinate += `[${obj.x},${obj.y},${obj.z}]`;
        if (i < this.ueList.length - 1) {
          ueCoordinate += '|';
        }
      }
      this.calculateForm.ueCoordinate = ueCoordinate;
    }
    let defaultBs = '';
    this.calculateForm.defaultBs = defaultBs;
    if (this.defaultBSList.length > 0) {
      // 現有基站
      for (let i = 0; i < this.defaultBSList.length; i++) {
        const obj = this.dragObject[this.defaultBSList[i]];
        // defaultBs += `[${obj.x},${obj.y},${obj.z},${obj.material}]`;
        defaultBs += `[${obj.x},${obj.y},${obj.z}]`;
        if (i < this.defaultBSList.length - 1) {
          defaultBs += '|';
        }
      }
      this.calculateForm.defaultBs = defaultBs;
    }
    let candidate = '';
    this.calculateForm.candidateBs = candidate;
    if (this.candidateList.length > 0) {
      // 新增基站
      for (let i = 0; i < this.candidateList.length; i++) {
        const obj = this.dragObject[this.candidateList[i]];
        // candidate += `[${obj.x},${obj.y},${obj.z},${obj.material}]`;
        candidate += `[${obj.x},${obj.y},${obj.z}]`;
        if (i < this.candidateList.length - 1) {
          candidate += '|';
        }
      }
      this.calculateForm.candidateBs = candidate;
    }

    // number type to number
    Object.keys(this.calculateForm).forEach((key) => {
      if (this.numColumnList.includes(key)) {
        this.calculateForm[key] = Number(this.calculateForm[key]);
      }
    });
  }

  /** 查詢進度 */
  getProgress() {
    const url = `${this.authService.API_URL}/progress/${this.taskid}/${this.authService.userToken}`;
    this.http.get(url).subscribe(
      res => {
        window.clearInterval(this.progressInterval);
        document.getElementById('percentageVal').innerHTML = Math.ceil(res['progress'] * 100).toString();
        if (res['progress'] === 1) {
          // done
          this.authService.spinnerHide();
          location.replace(`#/site/result?taskId=${this.taskid}`);
          location.reload();
        } else {
          // query again
          window.clearInterval(this.progressInterval);
          this.progressInterval = window.setTimeout(() => {
            this.getProgress();
          }, 3000);
        }

      }, err => {
        this.authService.spinnerHide();
        window.clearInterval(this.progressInterval);
      }
    );
  }

  changeSize(svgId) {
    this.svgId = svgId;
    this.target = document.querySelector(`#${svgId}`);
    const elementWidth = this.pixelXLinear(this.dragObject[svgId].width);
    const elementHeight = this.pixelYLinear(this.dragObject[svgId].height);
    this.frame.set('width', `${elementWidth}px`);
    this.frame.set('height', `${elementHeight}px`);
    this.setTransform(this.target);

    const svg = this.target.querySelector('svg');
    svg.setAttribute('width', elementWidth.toString());
    svg.setAttribute('height', elementHeight.toString());
    const dragRect = svg.querySelector('.drag_rect');
    const type = this.dragObject[this.svgId].element;
    if (type === 'rect') {
      // 方形
      dragRect.setAttribute('width', elementWidth.toString());
      dragRect.setAttribute('height', elementHeight.toString());
    } else if (type === 'ellipse') {
      // 圓形
      const val = (Plotly.d3.min([elementWidth, elementHeight]) / 2).toString();
      dragRect.setAttribute('rx', val.toString());
      dragRect.setAttribute('ry', val.toString());
      dragRect.setAttribute('cx', val.toString());
      dragRect.setAttribute('cy', val.toString());
    } else if (type === 'polygon') {
      // 三角形
      const points = `${elementWidth / 2},0 ${elementWidth}, ${elementHeight} 0, ${elementHeight}`;
      dragRect.setAttribute('points', points);
    }
    // this.setDragData();
    if (this.dragObject[this.svgId].type === 'defaultBS' || this.dragObject[this.svgId].type === 'candidate') {
      this.moveNumber(svgId);
    }
  }

  /** change X,Y */
  changePosition(svgId) {
    // this.svgId = svgId;
    this.target = document.querySelector(`#${svgId}`);
    const rect = this.target.getBoundingClientRect();
    const height = rect.height;

    const left = this.pixelXLinear(this.dragObject[svgId].x) + this.chartLeft;
    const bottom = this.chartBottom - this.pixelYLinear(this.dragObject[svgId].y);
    const yPos = bottom - height;
    this.frame.set('left', `${left}px`);
    this.frame.set('top', `${yPos}px`);
    if (this.dragObject[svgId].type === 'obstacle') {
      this.frame.set('width', `${this.pixelXLinear(this.dragObject[svgId].width)}px`);
      this.frame.set('height', `${this.pixelYLinear(this.dragObject[svgId].height)}px`);
    }
    this.setTransform(this.target);

    this.spanStyle[svgId].left = left;
    this.spanStyle[svgId].top = yPos;

    if (this.dragObject[svgId].type === 'defaultBS' || this.dragObject[svgId].type === 'candidate') {
      this.moveNumber(svgId);
    }
  }

  /** change rotate */
  changeRotate(svgId) {
    this.svgId = svgId;
    this.target = document.querySelector(`#${svgId}`);
    this.frame.set('transform', 'rotate', `${this.dragObject[svgId].rotate}deg`);
    this.setTransform(this.target);
    this.target.setAttribute('style', `transform: rotate(${this.dragObject[svgId].rotate}deg)`);
    if (this.dragObject[svgId].rotate === '0') {
      // 0時click才會生效
      this.target.click();
      this.target.blur();
    }
  }

  /** clear all */
  clearAll(type) {
    if (type === 'obstacle') {
      this.obstacleList.length = 0;
    } else if (type === 'defaultBS') {
      this.defaultBSList.length = 0;
    } else if (type === 'candidate') {
      this.candidateList.length = 0;
    } else if (type === 'UE') {
      this.ueList.length = 0;
    }
  }

  /** 圖區縮放 */
  plotResize() {
    // window.setTimeout(() => {
    //   const dArea = document.getElementById('d_area');
    //   if (dArea != null) {
    //     const dWidth = dArea.clientWidth;
    //     Plotly.relayout('chart', {
    //       width: dWidth
    //     }).then((gd) => {
    //       // 重新計算比例尺
    //       this.calScale(gd);
    //       // 物件移動
    //       const ary = _.concat(this.obstacleList, this.defaultBSList, this.candidateList, this.ueList);
    //       for (const item of ary) {
    //         this.changePosition(item);
    //       }
    //     });
    //   }
    // }, 300);
  }

  view3D() {
    this.view3dDialogConfig.data = {
      calculateForm: this.calculateForm,
      obstacleList: this.obstacleList,
      defaultBSList: this.defaultBSList,
      candidateList: this.candidateList,
      ueList: this.ueList,
      dragObject: this.dragObject
    };
    this.matDialog.open(View3dComponent, this.view3dDialogConfig);
    // sessionStorage.setItem('calculateForm', JSON.stringify(this.calculateForm));
    // sessionStorage.setItem('obstacleList', JSON.stringify(this.obstacleList));
    // sessionStorage.setItem('defaultBSList', JSON.stringify(this.defaultBSList));
    // sessionStorage.setItem('candidateList', JSON.stringify(this.candidateList));
    // sessionStorage.setItem('ueList', JSON.stringify(this.ueList));
    // sessionStorage.setItem('dragObject', JSON.stringify(this.dragObject));

    // this.router.navigate(['/site/view3d']);
  }

  /** export xlsx */
  export() {
    /* generate worksheet */
    // map
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    const mapData = [
      ['image', 'width', 'height', 'altitude', 'mapLayer', 'imageName'],
      [
        this.calculateForm.mapImage, this.calculateForm.width,
        this.calculateForm.height, this.calculateForm.altitude,
        this.zValues[0], this.calculateForm.mapName
      ]
    ];
    if (this.zValues.length > 1) {
      for (let i = 1; i < this.zValues.length; i++) {
        mapData.push([
          '', '', '', '', this.zValues[i], ''
        ]);
      }
    }
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(mapData);
    XLSX.utils.book_append_sheet(wb, ws, 'map');
    // defaultBS
    const baseStationData = [['x', 'y', 'z', 'material', 'color']];
    for (const item of this.defaultBSList) {
      baseStationData.push([
        this.dragObject[item].x, this.dragObject[item].y,
        this.dragObject[item].z, this.dragObject[item].material,
        this.dragObject[item].color
      ]);
    }
    const baseStationWS: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(baseStationData);
    XLSX.utils.book_append_sheet(wb, baseStationWS, 'base_station');
    // candidate
    const candidateData = [['x', 'y', 'z', 'material', 'color']];
    for (const item of this.candidateList) {
      candidateData.push([
        this.dragObject[item].x, this.dragObject[item].y,
        this.dragObject[item].z, this.dragObject[item].material,
        this.dragObject[item].color
      ]);
    }
    const candidateWS: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(candidateData);
    XLSX.utils.book_append_sheet(wb, candidateWS, 'candidate');
    // UE
    const ueData = [['x', 'y', 'z', 'material', 'color']];
    for (const item of this.ueList) {
      ueData.push([
        this.dragObject[item].x, this.dragObject[item].y,
        this.dragObject[item].z, this.dragObject[item].material,
        this.dragObject[item].color
      ]);
    }
    const ueWS: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(ueData);
    XLSX.utils.book_append_sheet(wb, ueWS, 'ue');
    // obstacle
    const obstacleData = [['x', 'y', 'width', 'height', 'altitude', 'rotate', 'material', 'color', 'shape']];
    for (const item of this.obstacleList) {
      obstacleData.push([
        this.dragObject[item].x, this.dragObject[item].y,
        this.dragObject[item].width, this.dragObject[item].height,
        this.dragObject[item].altitude, this.dragObject[item].rotate,
        this.dragObject[item].material, this.dragObject[item].color,
        this.dragObject[item].element
      ]);
    }
    const obstacleWS: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(obstacleData);
    XLSX.utils.book_append_sheet(wb, obstacleWS, 'obstacle');
    // bs parameters
    const bsData = [
      ['bsPowerMax', 'bsPowerMin', 'bsBeamIdMax', 'bsBeamIdMin', 'bandwidth', 'frequency'],
      [
        this.calculateForm.powerMaxRange, this.calculateForm.powerMinRange,
        // this.calculateForm.beamMaxId, this.calculateForm.beamMinId,
        '', '',
        this.calculateForm.bandwidth, this.calculateForm.frequency
      ]
    ];
    const bsWS: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(bsData);
    XLSX.utils.book_append_sheet(wb, bsWS, 'bs parameters');
    // algorithm parameters

    const algorithmData = [
      ['crossover', 'mutation', 'iteration', 'seed', 'computeRound', 'useUeCoordinate', 'pathLossModel'],
      [
        this.calculateForm.crossover, this.calculateForm.mutation,
        this.calculateForm.iteration, this.calculateForm.seed,
        1, this.calculateForm.useUeCoordinate, this.calculateForm.pathLossModelId
      ]
    ];
    const algorithmWS: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(algorithmData);
    XLSX.utils.book_append_sheet(wb, algorithmWS, 'algorithm parameters');
    // objective parameters
    const objectiveData = [
      ['objective', 'objectiveStopCondition', 'newBsNum'],
      [this.calculateForm.objectiveIndex, '', this.calculateForm.availableNewBsNumber]
    ];
    const objectiveWS: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(objectiveData);
    XLSX.utils.book_append_sheet(wb, objectiveWS, 'objective parameters');
    console.log(wb);
    /* save to file */
    XLSX.writeFile(wb, `${this.calculateForm.taskName}.xlsx`);
  }

  /** import xlsx */
  import(event) {
    /* wire up file reader */
    const target: DataTransfer = <DataTransfer> (event.target);
    if (target.files.length !== 1) {
      throw new Error('Cannot use multiple files');
    }
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      /* read workbook */
      const bstr: string = e.target.result;
      this.readXls(bstr);

      event.target.value = ''; // 清空
    };
    reader.readAsBinaryString(target.files[0]);
  }

  /** read xls */
  readXls(result) {
    this.wb = XLSX.read(result, {type: 'binary'});

    /* map sheet */
    const map: string = this.wb.SheetNames[0];
    const mapWS: XLSX.WorkSheet = this.wb.Sheets[map];
    const mapData = (XLSX.utils.sheet_to_json(mapWS, {header: 1}));
    this.calculateForm.mapImage = '';
    const keyMap = {};
    Object.keys(mapData[0]).forEach((key) => {
      keyMap[mapData[0][key]] = key;
    });
    this.zValues.length = 0;
    for (let i = 1; i < mapData.length; i++) {
      this.calculateForm.mapImage += mapData[i][0];
      if (typeof mapData[i][keyMap['mapLayer']] !== 'undefined') {
        if (mapData[i][keyMap['mapLayer']] !== '') {
          this.zValues.push(mapData[i][keyMap['mapLayer']]);
        }
      }
    }
    this.calculateForm.width = mapData[1][keyMap['width']];
    this.calculateForm.height = mapData[1][keyMap['height']];
    this.calculateForm.altitude = mapData[1][keyMap['altitude']];
    // mapName or imageName
    if (typeof mapData[1][keyMap['mapName']] === 'undefined') {
      this.calculateForm.mapName = mapData[1][keyMap['imageName']];
    } else {
      this.calculateForm.mapName = mapData[1][keyMap['mapName']];
    }

    this.initData(true);
  }

  setImportData() {
    this.obstacleList.length = 0;
    this.defaultBSList.length = 0;
    this.candidateList.length = 0;
    this.ueList.length = 0;
    /* base station sheet */
    const baseStation: string = this.wb.SheetNames[1];
    const baseStationWS: XLSX.WorkSheet = this.wb.Sheets[baseStation];
    const baseStationData = (XLSX.utils.sheet_to_json(baseStationWS, {header: 1}));
    if (baseStationData.length > 1) {
      for (let i = 1; i < baseStationData.length; i++) {
        const id = `defaultBS_${(i - 1)}`;
        const material = (typeof baseStationData[i][3] === 'undefined' ? '0' : baseStationData[i][3]);
        const color = (typeof baseStationData[i][4] === 'undefined' ? 'green' : baseStationData[i][4]);

        this.dragObject[id] = {
          x: baseStationData[i][0],
          y: baseStationData[i][1],
          z: baseStationData[i][2],
          width: this.xLinear(30),
          height: this.yLinear(30),
          altitude: 50,
          rotate: 0,
          title: this.svgMap['defaultBS'].title,
          type: this.svgMap['defaultBS'].type,
          color: color,
          material: material,
          element: this.svgMap['defaultBS'].element
        };
        this.defaultBSList.push(id);
        this.spanStyle[id] = {
          left: `${this.pixelXLinear(baseStationData[i][0])}px`,
          top: `${this.chartHeight - 30 - this.pixelYLinear(baseStationData[i][1])}px`,
          width: `30px`,
          height: `30px`
        };
        this.svgStyle[id] = {
          display: 'inherit',
          width: 30,
          height: 30
        };
        this.pathStyle[id] = {
          fill: color
        };
        window.setTimeout(() => {
          this.moveNumber(id);
        }, 0);
      }
    }
    /* candidate sheet */
    const candidate: string = this.wb.SheetNames[2];
    const candidateWS: XLSX.WorkSheet = this.wb.Sheets[candidate];
    const candidateData = (XLSX.utils.sheet_to_json(candidateWS, {header: 1}));
    if (candidateData.length > 1) {
      for (let i = 1; i < candidateData.length; i++) {
        const id = `candidate_${(i - 1)}`;
        this.candidateList.push(id);
        const material = (typeof candidateData[i][3] === 'undefined' ? '0' : candidateData[i][3]);
        const color = (typeof candidateData[i][4] === 'undefined' ? 'green' : candidateData[i][4]);

        this.dragObject[id] = {
          x: candidateData[i][0],
          y: candidateData[i][1],
          z: candidateData[i][2],
          width: this.xLinear(30),
          height: this.yLinear(30),
          altitude: 50,
          rotate: 0,
          title: this.svgMap['candidate'].title,
          type: this.svgMap['candidate'].type,
          color: color,
          material: material,
          element: this.svgMap['candidate'].element
        };

        this.spanStyle[id] = {
          left: `${this.pixelXLinear(candidateData[i][0])}px`,
          top: `${this.chartHeight - 30 - this.pixelYLinear(candidateData[i][1])}px`,
          width: `30px`,
          height: `30px`
        };
        this.svgStyle[id] = {
          display: 'inherit',
          width: 30,
          height: 30
        };
        this.pathStyle[id] = {
          fill: color
        };

        window.setTimeout(() => {
          this.moveNumber(id);
        }, 0);
      }
    }
    /* UE sheet */
    const ue: string = this.wb.SheetNames[3];
    const ueWS: XLSX.WorkSheet = this.wb.Sheets[ue];
    const ueData = (XLSX.utils.sheet_to_json(ueWS, {header: 1}));
    if (ueData.length > 1) {
      for (let i = 1; i < ueData.length; i++) {
        const id = `UE_${(i - 1)}`;
        this.ueList.push(id);

        const material = (typeof ueData[i][3] === 'undefined' ? '0' : ueData[i][3]);
        const color = (typeof ueData[i][4] === 'undefined' ? 'green' : ueData[i][4]);

        this.dragObject[id] = {
          x: ueData[i][0],
          y: ueData[i][1],
          z: ueData[i][2],
          width: 30,
          height: 30,
          altitude: 50,
          rotate: 0,
          title: this.svgMap['UE'].title,
          type: this.svgMap['UE'].type,
          color: color,
          material: material,
          element: this.svgMap['UE'].element
        };
        this.spanStyle[id] = {
          left: `${this.pixelXLinear(ueData[i][0])}px`,
          top: `${this.chartHeight - 30 - this.pixelYLinear(ueData[i][1])}px`,
          width: `20px`,
          height: `30px`
        };
        this.svgStyle[id] = {
          display: 'inherit',
          width: 30,
          height: 30
        };
        this.pathStyle[id] = {
          fill: color
        };
      }
    }
    /* obstacle sheet */
    const obstacle: string = this.wb.SheetNames[4];
    const obstacleWS: XLSX.WorkSheet = this.wb.Sheets[obstacle];
    const obstacleData = (XLSX.utils.sheet_to_json(obstacleWS, {header: 1}));
    if (obstacleData.length > 1) {
      let rect = 0;
      let ellipse = 0;
      let polygon = 0;
      for (let i = 1; i < obstacleData.length; i++) {
        if ((<Array<any>> obstacleData[i]).length === 0) {
          continue;
        }
        let id;
        let type;
        let shape = obstacleData[i][8];
        if (shape === 'rect') {
          id = `rect_${rect}`;
          type = 'rect';
          rect++;
        } else if (shape === 'ellipse') {
          id = `ellipse_${ellipse}`;
          type = 'ellipse';
          ellipse++;
        } else if (shape === 'polygon') {
          id = `polygon_${polygon}`;
          type = 'polygon';
          polygon++;
        } else {
          // default
          shape = 'rect';
          id = `rect_${rect}`;
          type = 'rect';
          rect++;
        }
        const material = (typeof obstacleData[i][6] === 'undefined' ? '0' : obstacleData[i][6].toString());
        const color = (typeof obstacleData[i][7] === 'undefined' ? 'green' : obstacleData[i][7]);

        this.dragObject[id] = {
          x: obstacleData[i][0],
          y: obstacleData[i][1],
          z: 0,
          width: obstacleData[i][2],
          height: obstacleData[i][3],
          altitude: obstacleData[i][4],
          rotate: (typeof obstacleData[i][5] === 'undefined' ? 0 : obstacleData[i][5]),
          title: this.svgMap[type].title,
          type: this.svgMap[type].type,
          color: color,
          material: material,
          element: shape
        };
        this.svgStyle[id] = {
          display: 'inherit',
          width: this.pixelXLinear(this.dragObject[id].width),
          height: this.pixelYLinear(this.dragObject[id].height)
        };
        if (shape === 'rect') {
          this.spanStyle[id] = {
            left: `${this.pixelXLinear(this.dragObject[id].x)}px`,
            top: `${this.chartHeight - this.pixelYLinear(this.dragObject[id].height) - this.pixelYLinear(obstacleData[i][1])}px`,
            width: `${this.pixelXLinear(obstacleData[i][2])}px`,
            height: `${this.pixelYLinear(obstacleData[i][3])}px`,
            transform: `rotate(${this.dragObject[id].rotate}deg)`
          };
          this.rectStyle[id] = {
            width: this.pixelXLinear(this.dragObject[id].width),
            height: this.pixelYLinear(this.dragObject[id].height),
            fill: this.dragObject[id].color
          };
        } else if (shape === 'ellipse') {
          this.spanStyle[id] = {
            left: `${this.pixelXLinear(this.dragObject[id].x)}px`,
            top: `${this.pixelYLinear(this.dragObject[id].y)}px`,
            width: `${this.pixelXLinear(this.dragObject[id].width * 2)}px`,
            height: `${this.pixelYLinear(this.dragObject[id].height * 2)}px`
          };

          const x = (this.pixelXLinear(this.dragObject[id].width) / 2).toString();
          const y = (this.pixelYLinear(this.dragObject[id].height) / 2).toString();
          this.ellipseStyle[id] = {
            cx: x,
            cy: y,
            rx: x,
            ry: y,
            fill: this.dragObject[id].color
          };
        } else if (shape === 'polygon') {
          this.spanStyle[id] = {
            left: `${this.pixelXLinear(this.dragObject[id].x)}`,
            top: `${this.pixelYLinear(this.dragObject[id].y)}`,
            width: this.pixelXLinear(obstacleData[i][2] / 2),
            height: this.pixelYLinear(obstacleData[i][3] / 2)
          };
          const width = this.pixelXLinear(this.dragObject[id].width);
          const height = this.pixelYLinear(this.dragObject[id].height);
          const points = `${width / 2},0 ${width}, ${height} 0, ${height}`;
          this.polygonStyle[id] = {
            points: points,
            fill: this.dragObject[id].color
          };
        }
        this.obstacleList.push(id);
      }
    }
    /* bs parameters sheet */
    const bsParameters: string = this.wb.SheetNames[5];
    const bsParametersWS: XLSX.WorkSheet = this.wb.Sheets[bsParameters];
    const bsParametersData = (XLSX.utils.sheet_to_json(bsParametersWS, {header: 1}));
    if (bsParametersData.length > 1) {
      this.calculateForm.powerMaxRange = Number(bsParametersData[1][0]);
      this.calculateForm.powerMinRange = Number(bsParametersData[1][1]);
      this.calculateForm.beamMaxId = Number(bsParametersData[1][2]);
      this.calculateForm.beamMinId = Number(bsParametersData[1][3]);
      this.calculateForm.bandwidth = Number(bsParametersData[1][4]);
      this.calculateForm.frequency = Number(bsParametersData[1][5]);
    }
    /* algorithm parameters sheet */
    const algorithmParameters: string = this.wb.SheetNames[6];
    const algorithmParametersWS: XLSX.WorkSheet = this.wb.Sheets[algorithmParameters];
    const algorithmParametersData = (XLSX.utils.sheet_to_json(algorithmParametersWS, {header: 1}));
    if (algorithmParametersData.length > 1) {
      this.calculateForm.crossover = Number(algorithmParametersData[1][0]);
      this.calculateForm.mutation = Number(algorithmParametersData[1][1]);
      this.calculateForm.iteration = Number(algorithmParametersData[1][2]);
      this.calculateForm.seed = Number(algorithmParametersData[1][3]);
      // this.calculateForm.computeRound = Number(algorithmParametersData[1][4]);
      this.calculateForm.useUeCoordinate = Number(algorithmParametersData[1][5]);
      this.calculateForm.pathLossModelId = Number(algorithmParametersData[1][6]);
    }
    /* objective parameters sheet */
    const objectiveParameters: string = this.wb.SheetNames[7];
    const objectiveParametersWS: XLSX.WorkSheet = this.wb.Sheets[objectiveParameters];
    const objectiveParametersData = (XLSX.utils.sheet_to_json(objectiveParametersWS, {header: 1}));
    if (objectiveParametersData.length > 1) {
      // this.calculateForm.objectiveIndex = objectiveParametersData[1][0];
      // this.calculateForm.obstacleInfo = objectiveParametersData[1][1];
      this.calculateForm.availableNewBsNumber = Number(objectiveParametersData[1][2]);
    }
    if (this.calculateForm.objectiveIndex === '') {
      this.calculateForm.objectiveIndex = '2';
    }
  }

  save() {
    this.authService.spinnerShowAsHome();
    this.setForm();

    const url = `${this.authService.API_URL}/storeResult`;
    this.http.post(url, JSON.stringify(this.calculateForm)).subscribe(
      res => {
        this.taskid = res['taskid'];
        this.authService.spinnerHide();
      },
      err => {
        this.authService.spinnerHide();
        console.log(err);
      }
    );
  }

  edit() {
    // obstacleInfo
    const obstacle = this.calculateForm.obstacleInfo
    .replace(new RegExp('\\[', 'gi'), '').replace(new RegExp('\\]', 'gi'), '').split('|');
    const obstacleLen = obstacle.length;
    for (let i = 0; i < obstacleLen; i++) {
      const item = obstacle[i].split(',');
      const id = `rect_${i}`;
      this.obstacleList.push(id);
      this.dragObject[id] = {
        x: item[0],
        y: item[1],
        z: 0,
        width: item[2],
        height: item[3],
        altitude: item[4],
        rotate: item[5],
        title: this.svgMap['rect'].title,
        type: this.svgMap['rect'].type,
        color: 'green',
        material: item[6],
        element: 'rect'
      };
      this.spanStyle[id] = {
        left: `${this.pixelXLinear(item[0])}px`,
        top: `${this.chartHeight - this.pixelYLinear(item[3]) - this.pixelYLinear(item[1])}px`,
        width: `${this.pixelXLinear(item[2])}px`,
        height: `${this.pixelYLinear(item[3])}px`
      };
      this.svgStyle[id] = {
        display: 'inherit',
        width: this.pixelXLinear(item[2]),
        height: this.pixelYLinear(item[3])
      };
      this.rectStyle[id] = {
        width: this.pixelXLinear(item[2]),
        height: this.pixelYLinear(item[3]),
        fill: 'green'
      };
    }
    // defaultBs
    if (this.calculateForm.defaultBs !== '') {
      const defaultBS = this.calculateForm.defaultBs
      .replace(new RegExp('\\[', 'gi'), '').replace(new RegExp('\\]', 'gi'), '').split('|');
      const defaultBSLen = defaultBS.length;
      for (let i = 0; i < defaultBSLen; i++) {
        const item = defaultBS[i].split(',');
        const id = `defaultBS_${i}`;
        this.defaultBSList.push(id);
        this.dragObject[id] = {
          x: item[0],
          y: item[1],
          z: item[2],
          width: 30,
          height: 30,
          altitude: 50,
          rotate: 0,
          title: this.svgMap['defaultBS'].title,
          type: this.svgMap['defaultBS'].type,
          color: 'green',
          material: '0',
          element: 'defaultBS'
        };
        this.spanStyle[id] = {
          left: `${this.pixelXLinear(item[0])}px`,
          top: `${this.chartHeight - 30 - this.pixelYLinear(item[1])}px`,
          width: `30px`,
          height: `30px`
        };
        this.svgStyle[id] = {
          display: 'inherit',
          width: 30,
          height: 30
        };
        this.pathStyle[id] = {
          fill: 'green'
        };
        this.moveNumber(id);
      }
    }
    // candidate
    const candidate = this.calculateForm.candidateBs
    .replace(new RegExp('\\[', 'gi'), '').replace(new RegExp('\\]', 'gi'), '').split('|');
    const candidateLen = candidate.length;
    for (let i = 0; i < candidateLen; i++) {
      const item = candidate[i].split(',');
      const id = `candidate_${i}`;
      this.candidateList.push(id);
      this.dragObject[id] = {
        x: item[0],
        y: item[1],
        z: item[2],
        width: 30,
        height: 30,
        altitude: 50,
        rotate: 0,
        title: this.svgMap['candidate'].title,
        type: this.svgMap['candidate'].type,
        color: 'green',
        material: '0',
        element: 'candidate'
      };
      this.spanStyle[id] = {
        left: `${this.pixelXLinear(item[0])}px`,
        top: `${this.chartHeight - 30 - this.pixelYLinear(item[1])}px`,
        width: `30px`,
        height: `30px`
      };
      this.svgStyle[id] = {
        display: 'inherit',
        width: 30,
        height: 30
      };
      this.pathStyle[id] = {
        fill: 'green'
      };
      window.setTimeout(() => {
        this.moveNumber(id);
      }, 0);
    }
    // UE
    const ue = this.calculateForm.ueCoordinate
    .replace(new RegExp('\\[', 'gi'), '').replace(new RegExp('\\]', 'gi'), '').split('|');
    const ueLen = ue.length;
    for (let i = 0; i < ueLen; i++) {
      const item = ue[i].split(',');
      const id = `ue_${i}`;
      this.ueList.push(id);
      this.dragObject[id] = {
        x: item[0],
        y: item[1],
        z: item[2],
        width: 20,
        height: 30,
        altitude: 50,
        rotate: 0,
        title: this.svgMap['UE'].title,
        type: this.svgMap['UE'].type,
        color: 'green',
        material: '0',
        element: 'UE'
      };
      this.spanStyle[id] = {
        left: `${this.pixelXLinear(item[0])}px`,
        top: `${this.chartHeight - 30 - this.pixelYLinear(item[1])}px`,
        width: `20px`,
        height: `30px`
      };
      this.svgStyle[id] = {
        display: 'inherit',
        width: 20,
        height: 30
      };
      this.pathStyle[id] = {
        fill: 'green'
      };
    }

  }

  /** 運算結果 */
  result() {
    // location.replace(`#/site/result?taskId=${this.taskid}`);
    // location.reload();
    this.router.navigate(['/site/result'], { queryParams: { taskId: this.taskid }});
  }

}

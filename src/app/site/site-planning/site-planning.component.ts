import { Component, OnInit, HostListener, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { OnPinch, OnScale, OnDrag, OnRotate, OnResize, OnWarp } from 'moveable';
import { Frame } from 'scenejs';
import { NgxMoveableComponent } from 'ngx-moveable';
import { TaskFormService } from '../task-form.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { CalculateForm } from '../../form/CalculateForm';
import * as _ from 'lodash';
import { OnDragEnd } from 'gesto';

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

  @ViewChild('label') label: ElementRef;
  @ViewChild('moveable') moveable: NgxMoveableComponent;
  // @ViewChildren(TemplateRef) templateList: QueryList<TemplateRef<any>>;

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
      scaleX: 1,
      scaleY: 1,
      matrix3d: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
    }
  });
  iconList = [1, 2, 3];
  target;

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
  dragList = [];
  dragObject = {};

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
        this.imageSrc = reader.result;
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
    // add new element
    const newElement = document.getElementById('new_element');
    const len = newElement.querySelectorAll('span').length;
    const elm = event.target.cloneNode();
    elm.innerHTML = event.target.innerHTML;
    elm.setAttribute('id', `drag_${len + 1}`);
    this.dragList.push(`drag_${len + 1}`);
    this.dragObject[`drag_${len + 1}`] = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      altitude: 0,
      rotate: 0
    };
    document.getElementById('new_element').appendChild(elm);
    window.setTimeout(() => {
      this.target = elm;
      elm.addEventListener('click', this.newElementClick.bind(this));
      this.moveable.ngOnInit();
      elm.style.position = 'relative';
    }, 0);

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

  onDrag({ target, clientX, clientY, top, left, isPinch }: OnDrag) {
    this.frame.set('left', `${left}px`);
    this.frame.set('top', `${top}px`);
    this.setTransform(target);
    if (!isPinch) {
      this.setLabel(clientX, clientY, `X: ${left}px<br/>Y: ${top}px`);
    }
    this.dragObject[target.id].x = clientX;
    this.dragObject[target.id].y = clientY;
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
  }

  onRotate({ target, clientX, clientY, beforeDelta, isPinch }: OnRotate) {
    const deg = parseFloat(this.frame.get('transform', 'rotate')) + beforeDelta;

    this.frame.set('transform', 'rotate', `${deg}deg`);
    this.setTransform(target);
    if (!isPinch) {
      this.setLabel(clientX, clientY, `R: ${deg.toFixed(1)}`);
    }
    this.dragObject[target.id].rotate = deg;
  }

  onResize({ target, clientX, clientY, width, height, isPinch }: OnResize) {
    this.frame.set('width', `${width}px`);
    this.frame.set('height', `${height}px`);
    this.setTransform(target);
    if (!isPinch) {
      this.setLabel(clientX, clientY, `W: ${width}px<br/>H: ${height}px`);
    }
    this.dragObject[target.id].width = width;
    this.dragObject[target.id].height = height;
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
    this.target.style.left = this.frame.get('left');
    this.target.style.top = this.frame.get('top')
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

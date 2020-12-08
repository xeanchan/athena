import { Component, OnInit, HostListener, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { OnPinch, OnScale, OnDrag, OnRotate, OnResize, OnWarp } from 'moveable';
import { Frame } from 'scenejs';
import { NgxMoveableComponent } from 'ngx-moveable';

@Component({
  selector: 'app-site-planning',
  templateUrl: './site-planning.component.html',
  styleUrls: ['./site-planning.component.scss']
})
export class SitePlanningComponent implements OnInit, AfterViewInit {

  constructor() { }

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

  @HostListener('document:click', ['$event'])
  clickout(event) {
    console.log(this.target)
    if (typeof this.target !== 'undefined') {
      if (this.target.contains(event.target)) {
        // this.text = "clicked inside";
        this.live = true;
      } else {
        this.moveableDestroy();
        this.live = false;
        // this.text = "clicked outside";
      }
    }
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    this.moveable.destroy();
  }

  moveClick(event) {
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
          <br/>S: ${this.frame.get('transform', 'scaleX').toFixed(2)}, ${this.frame
          .get('transform', 'scaleY')
          .toFixed(2)}
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
  }
    

  moveableDestroy() {
    this.moveable.destroy();
  }


}

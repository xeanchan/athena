import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CalculateForm } from '../form/CalculateForm';
import { AuthService } from '../service/auth.service';
import { FormControl, FormGroup, Validators, ValidatorFn, ValidationErrors } from '@angular/forms';

/**
 * 新增場域Dialog
 */
@Component({
  selector: 'app-new-planning',
  templateUrl: './new-planning.component.html',
  styleUrls: ['./new-planning.component.scss']
})
export class NewPlanningComponent implements OnInit {

  constructor(
    private router: Router,
    private authService: AuthService,
    private matDialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data) {
      sessionStorage.removeItem('calculateForm');
      sessionStorage.removeItem('importFile');
      sessionStorage.removeItem('taskName');
      this.timeInterval = data.timeInterval;
    }

  /** 表單 */
  calculateForm: CalculateForm = new CalculateForm();
  /** 驗證taskName必填用 */
  formGroup: FormGroup;
  /** 驗證場域尺寸必填用 */
  sizeGroup: FormGroup;
  /** Show圖片必選error message */
  showImgMsg = false;
  /** 列表頁的timeInterval，離開時清除 */
  timeInterval;

  /** 表單-taskName */
  get taskName() { return this.formGroup.get('taskName'); }
  /** 表單-width */
  get width() { return this.sizeGroup.get('width'); }
  /** 表單-height */
  get height() { return this.sizeGroup.get('height'); }
  /** 表單-altitude */
  get altitude() { return this.sizeGroup.get('altitude'); }

  ngOnInit() {

    this.calculateForm.sessionid = this.authService.userToken;
    // taskName設為必填
    this.formGroup = new FormGroup({
      taskName: new FormControl(this.calculateForm.taskName, [
        Validators.required
      ])
    });

    // 場域尺寸驗證
    const sizeValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
      const width = control.get('width');
      const height = control.get('height');
      const altitude = control.get('altitude');

      if (width.valid && height.valid && altitude.valid) {
        return null;
      } else {
        return { sizeRevealed: true };
      }
    };

    this.sizeGroup = new FormGroup({
      width: new FormControl(),
      height: new FormControl(),
      altitude: new FormControl()
    }, { validators: sizeValidator });
  }

  /**
   * File upload
   * @param event file
   */
  fileChange(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.calculateForm.mapImage = reader.result.toString();
    };
    this.calculateForm.mapName = file.name;
    this.showImgMsg = false;
  }

  /**
   * OK button，go to 場域page
   */
  ok() {
    const input: NodeListOf<HTMLInputElement> = document.querySelector('.modalContent').querySelectorAll('input[type="text"]');
    for (let i = 0; i < input.length; i++) {
      input[i].focus();
      input[i].blur();
    }
    if (this.calculateForm.mapName == null) {
      this.showImgMsg = true;
      return;
    }
    if (this.formGroup.invalid || this.sizeGroup.invalid) {
      return;
    }
    // clear表單頁timeInterval
    window.clearInterval(this.timeInterval);
    sessionStorage.setItem('calculateForm', JSON.stringify(this.calculateForm));
    this.matDialog.closeAll();
    // location to 場域頁
    this.router.navigate(['/site/site-planning']);
    Object.keys(sessionStorage).forEach((d) => {
      if (d.indexOf('form_') !== -1) {
        // 刪除其他task暫存
        sessionStorage.removeItem(d);
      }
    });
  }

  /**
   * 匯入xlsx
   * @param event file
   */
  import(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // xlsx結果寫入sessionStorage，場域頁使用
      sessionStorage.setItem('importFile', reader.result.toString());
      const name = file.name.substring(0, file.name.lastIndexOf('.'));
      sessionStorage.setItem('taskName', name);
      window.clearInterval(this.timeInterval);
      this.matDialog.closeAll();
      Object.keys(sessionStorage).forEach((d) => {
        if (d.indexOf('form_') !== -1) {
          // 刪除其他task暫存
          sessionStorage.removeItem(d);
        }
      });
      this.router.navigate(['/site/site-planning']);
    };
  }

}

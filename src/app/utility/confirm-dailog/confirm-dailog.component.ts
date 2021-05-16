import { Component, OnInit, Inject, EventEmitter } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

/**
 * 公用Confirm dialog util
 */
@Component({
  selector: 'app-confirm-dailog',
  templateUrl: './confirm-dailog.component.html',
  styleUrls: ['./confirm-dailog.component.scss']
})
export class ConfirmDailogComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<ConfirmDailogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {
      this.infoMessage = data.infoMessage;
    }

  /** message */
  infoMessage;
  /** Click ok */
  onOK = new EventEmitter();

  ngOnInit() {
  }

  ok() {
    this.onOK.emit();
    this.dialogRef.close();
  }

}

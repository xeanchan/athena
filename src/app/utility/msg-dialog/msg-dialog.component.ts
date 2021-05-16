import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig } from '@angular/material/dialog';

/**
 * 公用訊息 dialog util
 */
@Component({
  selector: 'app-msg-dialog',
  templateUrl: './msg-dialog.component.html',
  styleUrls: ['./msg-dialog.component.scss']
})
export class MsgDialogComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<MsgDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {
      this.title = data.title;
      this.infoMessage = data.infoMessage;
      if (typeof data.closeTime !== 'undefined') {
        this.closeTime = data.closeTime;
      }
      if (typeof data.type !== 'undefined') {
        this.type = data.type;
        if (this.type === 'error') {
          this.textClass = 'text-danger';
          if (typeof data.closeTime === 'undefined') {
            this.closeTime = 7500;
          }
        }
      }
      this.dialogConfig.autoFocus = false;
    }

  /** dialog config */
  dialogConfig = new MatDialogConfig();
  /** title */
  title = 'Message';
  /** message */
  infoMessage;
  /** auto close time */
  closeTime = 2000;
  /** text color */
  type = 'success';
  /** text css class */
  textClass = 'text-normal';

  ngOnInit() {
    this.dialogConfig.autoFocus = false;
    // 2秒關閉
    if (this.closeTime !== 0) {
      window.setTimeout(() => {
        this.dialogRef.close();
      }, this.closeTime);
    }
  }

}

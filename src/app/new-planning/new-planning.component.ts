import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { TaskFormService } from '../site/task-form.service';
import { CalculateForm } from '../form/CalculateForm';
import { AuthService } from '../service/auth.service';
import { FormControl, FormGroup, Validators, ValidatorFn, ValidationErrors } from '@angular/forms';

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
    private http: HttpClient,
    private taskFormService: TaskFormService) {
      sessionStorage.removeItem('sessionStorage');
    }

  calculateForm: CalculateForm = new CalculateForm();
  formGroup: FormGroup;
  sizeGroup: FormGroup;
  showImgMsg = false;

  get taskName() { return this.formGroup.get('taskName'); }
  get width() { return this.sizeGroup.get('width'); }
  get height() { return this.sizeGroup.get('height'); }
  get altitude() { return this.sizeGroup.get('altitude'); }

  ngOnInit() {
    this.calculateForm.sessionid = this.authService.userToken;

    this.formGroup = new FormGroup({
      taskName: new FormControl(this.calculateForm.taskName, [
        Validators.required
      ])
    });

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

  fileChange(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.calculateForm.mapImage = reader.result;
    };
    this.calculateForm.mapName = file.name;
    this.showImgMsg = false;
  }

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
    sessionStorage.setItem('calculateForm', JSON.stringify(this.calculateForm));
    this.taskFormService.calculateForm = this.calculateForm;
    this.matDialog.closeAll();
    this.router.navigate(['/site/site-planning']);
  }

}

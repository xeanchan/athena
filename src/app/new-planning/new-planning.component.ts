import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { TaskFormService } from '../site/task-form.service';
import { CalculateForm } from '../form/CalculateForm';
import { AuthService } from '../service/auth.service';

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

  ngOnInit() {
    this.calculateForm.sessionid = this.authService.userToken;
  }

  fileChange(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.calculateForm.mapImage = reader.result;
    };
    this.calculateForm.mapName = file.name;
  }

  ok() {
    sessionStorage.setItem('calculateForm', JSON.stringify(this.calculateForm));
    this.taskFormService.calculateForm = this.calculateForm;
    this.matDialog.closeAll();
    this.router.navigate(['/site/site-planning']);
  }

}

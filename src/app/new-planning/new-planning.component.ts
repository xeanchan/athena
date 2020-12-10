import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { TaskFormService } from '../site/task-form.service';

@Component({
  selector: 'app-new-planning',
  templateUrl: './new-planning.component.html',
  styleUrls: ['./new-planning.component.scss']
})
export class NewPlanningComponent implements OnInit {

  constructor(
    private router: Router,
    private matDialog: MatDialog,
    private http: HttpClient,
    private taskFormService: TaskFormService) { }

  ngOnInit() {
  }

  ok() {
    this.taskFormService.data = {
      name: 'AAA',
      taskId: '123'
    };
    this.matDialog.closeAll();
    this.router.navigate(['/site/site-planning']);
  }

}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpClient } from '@angular/common/http';
import { CalculateForm } from '../../form/CalculateForm';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private matDialog: MatDialog,
    public spinner: NgxSpinnerService,
    private http: HttpClient) { }

  taskId;
  result = {};
  calculateForm: CalculateForm = new CalculateForm();

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.taskId = params['taskId'];
      this.getResult();
    });

    // this.calculateForm = JSON.parse(sessionStorage.getItem('calculateForm'));
  }

  getResult() {
    const url = `${this.authService.API_URL}/completeCalcResult/${this.taskId}/${this.authService.userToken}`;
    this.http.get(url).subscribe(
      res => {
        // console.log(res)
        this.calculateForm = res['input'];
        this.result = res['output'];
        console.log(this.result)
      }
    );
  }

}

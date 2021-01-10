import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { HttpClient } from '@angular/common/http';
import { CalculateForm } from '../../form/CalculateForm';

@Component({
  selector: 'app-pdf',
  templateUrl: './pdf.component.html',
  styleUrls: ['./pdf.component.scss']
})
export class PdfComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private http: HttpClient) { }

  taskId = 'task_sel_26cc4b6e-7096-4202-aa39-500a1214df85_0';
  result = {};
  calculateForm: CalculateForm = new CalculateForm();

  ngOnInit() {
    // this.route.queryParams.subscribe(params => {
    //   this.taskId = params['taskId'];
    //   this.getResult();
    // });
    this.getResult();

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

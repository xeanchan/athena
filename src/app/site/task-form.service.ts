import { Injectable } from '@angular/core';
import { CalculateForm } from '../form/CalculateForm';

@Injectable({
  providedIn: 'root'
})
export class TaskFormService {

  constructor() { }

  calculateForm: CalculateForm;

}

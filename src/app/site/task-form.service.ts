import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TaskFormService {

  constructor() { }

  data = {
    taskId: '',
    name: ''
  };
}

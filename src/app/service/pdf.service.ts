import { Injectable } from '@angular/core';
import html2canvas from 'html2canvas';
import * as jsPDF from 'jspdf';
import { AuthService } from './auth.service';

/**
 * PDF Service
 */
@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor(private authService: AuthService) { }

  /**
   * export PDF
   * @param taskName 
   */
  async export(taskName) {
    this.authService.spinnerShow();
    const pdf = new jsPDF('p', 'mm', 'a4'); // A4 size page of PDF
    const area = document.querySelector('#pdf_area');
    const list = ['site_info', 'propose', 'signal', 'performace', 'statistics'];
    let i = 0;
    for (const id of list) {
      const data = <HTMLDivElement> area.querySelector(`#${id}`);
      await html2canvas(data).then(canvas => {
        // Few necessary setting options
        const imgWidth = 208;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        const contentDataURL = canvas.toDataURL('image/png');
        const position = 0;
        if (i > 0) {
          pdf.addPage();
        }
        pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
      });

      i++;
    }
    this.authService.spinnerHide();
    pdf.save(`${taskName}.pdf`); // Generated PDF
  }
}
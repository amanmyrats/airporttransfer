import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Observable, of } from 'rxjs';
import { Reservation } from '../models/reservation.model';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  constructor() {}

  downloadPdf(
    componentElement: HTMLElement, 
    reservation: Reservation, 
  ): Observable<boolean> {
    console.log("Inside pdf service");
    return new Observable(observer => {
      html2canvas(componentElement, {
        scale: 2, // Higher scale improves resolution
        useCORS: true, // Enable cross-origin images
        backgroundColor: '#ffffff' // Ensure white background
      }).then(canvas => {
        const pdf = new jsPDF('p', 'mm', 'a4', true);
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 190; // Full width of the PDF (A4)
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight, undefined, 'FAST'); // 'FAST' or 'MEDIUM'
        pdf.save(`${reservation.number} - Reservation Confirmation.pdf`);
        observer.next(true); // Emit success
        observer.complete();
      }).catch(error => {
        console.error('PDF generation failed:', error);
        observer.error(false); // Emit failure
      });
    });
  }
}

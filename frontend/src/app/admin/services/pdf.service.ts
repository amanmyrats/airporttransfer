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
      }).then((canvas: any) => {
        const pdf = new jsPDF('p', 'mm', 'a4', true);
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 190; // Full width of the PDF (A4)
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight, undefined, 'FAST'); // 'FAST' or 'MEDIUM'
        pdf.save(`${reservation.number} - Reservation Confirmation.pdf`);
        observer.next(true); // Emit success
        observer.complete();
      }).catch((error: any) => {
        console.error('PDF generation failed:', error);
        observer.error(false); // Emit failure
      });
    });
  }
}

// import { Injectable } from '@angular/core';
// import { PDFDocument } from 'pdf-lib'; // Import pdf-lib
// import domtoimage from 'dom-to-image-more'; // Import dom-to-image
// import { Observable } from 'rxjs';
// import { Reservation } from '../models/reservation.model';

// @Injectable({
//   providedIn: 'root',
// })
// export class PdfService {
//   constructor() {}

//   downloadPdf(
//     componentElement: HTMLElement,
//     reservation: Reservation
//   ): Observable<boolean> {
//     return new Observable((observer) => {
//       // Generate an image of the component using dom-to-image
//       domtoimage
//         .toPng(componentElement, { bgcolor: '#ffffff' }) // Ensure a white background
//         .then(async (imgDataUrl) => {
//           // Create a new PDF document
//           const pdfDoc = await PDFDocument.create();
//           const page = pdfDoc.addPage();

//           // Embed the image into the PDF
//           const imgBytes = await fetch(imgDataUrl).then((res) => res.arrayBuffer());
//           const embeddedImage = await pdfDoc.embedPng(imgBytes);

//           // Scale the image to fit the page
//           const imgWidth = page.getWidth();
//           const imgHeight =
//             (embeddedImage.height / embeddedImage.width) * imgWidth;

//           page.drawImage(embeddedImage, {
//             x: 0,
//             y: page.getHeight() - imgHeight,
//             width: imgWidth,
//             height: imgHeight,
//           });

//           // Save the PDF
//           const pdfBytes = await pdfDoc.save();
//           const blob = new Blob([pdfBytes], { type: 'application/pdf' });

//           // Trigger download
//           const url = URL.createObjectURL(blob);
//           const a = document.createElement('a');
//           a.href = url;
//           a.download = `${reservation.number} - Reservation Confirmation.pdf`;
//           a.click();
//           URL.revokeObjectURL(url);

//           observer.next(true); // Emit success
//           observer.complete();
//         })
//         .catch((error) => {
//           console.error('PDF generation failed:', error);
//           observer.error(false); // Emit failure
//         });
//     });
//   }
// }

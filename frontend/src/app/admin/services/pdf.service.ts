import { Injectable } from '@angular/core';
import { PDFDocument } from 'pdf-lib'; // Import pdf-lib
import domtoimage from 'dom-to-image-more'; // Import dom-to-image
import { Observable } from 'rxjs';
import { Reservation } from '../models/reservation.model';

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  constructor() {}

  downloadPdf(
    componentElement: HTMLElement,
    reservation: Reservation
  ): Observable<boolean> {
    return new Observable((observer) => {
      // Generate an image of the component using dom-to-image
      domtoimage
        .toPng(componentElement, { bgcolor: '#ffffff' }) // Ensure a white background
        .then(async (imgDataUrl) => {
          // Create a new PDF document
          const pdfDoc = await PDFDocument.create();
          const page = pdfDoc.addPage();

          // Embed the image into the PDF
          const imgBytes = await fetch(imgDataUrl).then((res) => res.arrayBuffer());
          const embeddedImage = await pdfDoc.embedPng(imgBytes);

          // Scale the image to fit the page
          const imgWidth = page.getWidth();
          const imgHeight =
            (embeddedImage.height / embeddedImage.width) * imgWidth;

          page.drawImage(embeddedImage, {
            x: 0,
            y: page.getHeight() - imgHeight,
            width: imgWidth,
            height: imgHeight,
          });

          // Save the PDF
          const pdfBytes = await pdfDoc.save();
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });

          // Trigger download
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${reservation.number} - Reservation Confirmation.pdf`;
          a.click();
          URL.revokeObjectURL(url);

          observer.next(true); // Emit success
          observer.complete();
        })
        .catch((error) => {
          console.error('PDF generation failed:', error);
          observer.error(false); // Emit failure
        });
    });
  }
}

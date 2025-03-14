import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-ssr-test',
  imports: [
    CommonModule, 
  ],
  templateUrl: './ssr-test.component.html',
  styleUrl: './ssr-test.component.scss'
})
export class SsrTestComponent {
  post: any = {
    title: 'Post Title',
    description: 'Post Description',
    content: 'Post Content', 
    imageUrl: 'https://via.placeholder.com/150'
  };

  faqs: any = [
    {
      question: 'Question',
      answer: 'Answer', 
      open: false
    }
  ]

}

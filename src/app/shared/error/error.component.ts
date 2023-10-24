import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-error',
  template: `<p class="error-message">{{ errorMessage }}</p>`,
  styles: [
    `
      .error-message
        color: rgb(216, 87, 87)
        font-weight: 600
    `,
  ],
})
export class ErrorComponent {
  @Input() errorMessage: string = '';
}

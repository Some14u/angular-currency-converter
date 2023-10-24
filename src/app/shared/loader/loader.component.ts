import { Component } from '@angular/core';

@Component({
  selector: 'app-loader',
  template: `<img src="assets/spinner.svg" alt="Loading..." class="spinner" />`,
  styles: [
    `
      .spinner
        width: 1em
        scale: 1.4
        aspect-ratio: 1
        transform: translate(1px, 1px)
    `,
  ],
})
export class LoaderComponent {}

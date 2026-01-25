import { Directive, ElementRef, Input, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[appAutoFocus]'
})
export class AutoFocusDirective implements AfterViewInit {
  @Input() appAutoFocus: string | boolean = '';

  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    if (this.appAutoFocus === 'true' || this.appAutoFocus === true) {
      setTimeout(() => {
        this.el.nativeElement.focus();
      }, 0);
    }
  }
}

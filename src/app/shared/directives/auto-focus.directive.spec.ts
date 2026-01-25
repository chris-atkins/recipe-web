import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AutoFocusDirective } from './auto-focus.directive';

@Component({
  template: `<input id="test-input" [appAutoFocus]="focusValue" />`
})
class TestComponent {
  focusValue: string | boolean = 'true';
}

describe('AutoFocusDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent, AutoFocusDirective]
    });
  });

  it('should focus the element when appAutoFocus is "true"', (done) => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    component.focusValue = 'true';
    fixture.detectChanges();

    setTimeout(() => {
      const input = fixture.nativeElement.querySelector('#test-input');
      expect(document.activeElement).toBe(input);
      done();
    }, 10);
  });

  it('should focus the element when appAutoFocus is boolean true', (done) => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    component.focusValue = true;
    fixture.detectChanges();

    setTimeout(() => {
      const input = fixture.nativeElement.querySelector('#test-input');
      expect(document.activeElement).toBe(input);
      done();
    }, 10);
  });

  it('should not focus the element when appAutoFocus is "false"', (done) => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    component.focusValue = 'false';
    fixture.detectChanges();

    setTimeout(() => {
      const input = fixture.nativeElement.querySelector('#test-input');
      expect(document.activeElement).not.toBe(input);
      done();
    }, 10);
  });

  it('should not focus the element when appAutoFocus is empty string', (done) => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    component.focusValue = '';
    fixture.detectChanges();

    setTimeout(() => {
      const input = fixture.nativeElement.querySelector('#test-input');
      expect(document.activeElement).not.toBe(input);
      done();
    }, 10);
  });
});

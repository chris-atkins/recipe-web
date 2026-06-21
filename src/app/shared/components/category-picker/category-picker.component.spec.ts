import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { CategoryPickerComponent } from './category-picker.component';

describe('CategoryPickerComponent', () => {
  let component: CategoryPickerComponent;
  let fixture: ComponentFixture<CategoryPickerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CategoryPickerComponent],
      imports: [CommonModule]
    });
    fixture = TestBed.createComponent(CategoryPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders one pill per preset category plus the add-your-own pill', () => {
    const presetPills = fixture.nativeElement.querySelectorAll('.cat-pill:not(.cat-add)');
    expect(presetPills.length).toBe(8);
    expect(fixture.nativeElement.querySelector('.cat-add')).toBeTruthy();
  });

  it('selecting a preset emits it and marks it selected, dimming the rest', () => {
    spyOn(component.categoryChange, 'emit');
    component.selectPreset('Dessert');
    fixture.detectChanges();

    expect(component.categoryChange.emit).toHaveBeenCalledWith('Dessert');
    expect(component.category).toBe('Dessert');
    const selected = fixture.nativeElement.querySelectorAll('.cat-pill.selected');
    const dimmed = fixture.nativeElement.querySelectorAll('.cat-pill.dimmed');
    expect(selected.length).toBe(1);
    expect(dimmed.length).toBe(7);
  });

  it('re-selecting the active preset clears the selection (emits null)', () => {
    component.selectPreset('Dessert');
    spyOn(component.categoryChange, 'emit');

    component.selectPreset('Dessert');

    expect(component.category).toBeNull();
    expect(component.categoryChange.emit).toHaveBeenCalledWith(null);
  });

  it('adds a custom category Title-cased, selected, with the neutral chip', () => {
    spyOn(component.categoryChange, 'emit');
    component.startAdd();
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('.pill-input');
    expect(input).toBeTruthy();
    input.value = 'holiday brunch';
    component.commitAdd();
    fixture.detectChanges();

    expect(component.category).toBe('Holiday Brunch');
    expect(component.categoryChange.emit).toHaveBeenCalledWith('Holiday Brunch');
    expect(component.isCustomSelected()).toBe(true);
    expect(fixture.nativeElement.querySelector('.cat-custom')).toBeTruthy();
  });

  it('ignores an empty custom entry', () => {
    spyOn(component.categoryChange, 'emit');
    component.startAdd();
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('.pill-input');
    input.value = '   ';
    component.commitAdd();

    expect(component.category).toBeNull();
    expect(component.categoryChange.emit).not.toHaveBeenCalled();
  });

  it('shows the required error and outline when invalid', () => {
    component.invalid = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.cat-error')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.category-picker.invalid')).toBeTruthy();
  });

  it('clears the invalid state when a category is selected', () => {
    component.invalid = true;
    spyOn(component.invalidChange, 'emit');

    component.selectPreset('Soup');

    expect(component.invalid).toBe(false);
    expect(component.invalidChange.emit).toHaveBeenCalledWith(false);
  });

  it('commits a custom category on Enter and ignores it on Escape', () => {
    component.startAdd();
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.pill-input') as HTMLInputElement).value = 'brunch';
    component.onCustomKey(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(component.category).toBe('Brunch');

    component.startAdd();
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.pill-input') as HTMLInputElement).value = 'ignored';
    component.onCustomKey(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(component.adding).toBe(false);
    expect(component.category).toBe('Brunch');
  });

  it('commitAdd does nothing when not in adding mode', () => {
    spyOn(component.categoryChange, 'emit');
    component.commitAdd();
    expect(component.categoryChange.emit).not.toHaveBeenCalled();
  });
});

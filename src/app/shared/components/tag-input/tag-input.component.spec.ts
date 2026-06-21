import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { TagInputComponent } from './tag-input.component';

describe('TagInputComponent', () => {
  let component: TagInputComponent;
  let fixture: ComponentFixture<TagInputComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TagInputComponent],
      imports: [CommonModule]
    });
    fixture = TestBed.createComponent(TagInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders one chip per tag plus the create pill', () => {
    component.tags = ['Vegan', 'Quick'];
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.chip').length).toBe(2);
    expect(fixture.nativeElement.querySelector('.tag-add')).toBeTruthy();
  });

  it('adds a tag Title-cased and emits a new array', () => {
    spyOn(component.tagsChange, 'emit');
    component.addTag('high protein');

    expect(component.tags).toEqual(['High Protein']);
    expect(component.tagsChange.emit).toHaveBeenCalledWith(['High Protein']);
  });

  it('de-dupes case-insensitively', () => {
    component.tags = ['Vegan'];
    spyOn(component.tagsChange, 'emit');

    component.addTag('VEGAN');

    expect(component.tags).toEqual(['Vegan']);
    expect(component.tagsChange.emit).not.toHaveBeenCalled();
  });

  it('ignores empty/whitespace tags', () => {
    spyOn(component.tagsChange, 'emit');
    component.addTag('   ');
    expect(component.tags).toEqual([]);
    expect(component.tagsChange.emit).not.toHaveBeenCalled();
  });

  it('removes a chip and emits the remaining tags', () => {
    component.tags = ['Vegan', 'Quick'];
    spyOn(component.tagsChange, 'emit');

    component.removeChip('Vegan');

    expect(component.tags).toEqual(['Quick']);
    expect(component.tagsChange.emit).toHaveBeenCalledWith(['Quick']);
  });

  it('commits the in-place input value as a chip', () => {
    component.startAdd();
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('.pill-input');
    input.value = 'one pot';
    component.commitAdd();

    expect(component.tags).toEqual(['One Pot']);
    expect(component.adding).toBe(false);
  });

  it('adds on Enter and comma and cancels on Escape', () => {
    component.startAdd();
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.pill-input') as HTMLInputElement).value = 'spicy';
    component.onKey(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(component.tags).toEqual(['Spicy']);

    component.startAdd();
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.pill-input') as HTMLInputElement).value = 'vegan';
    component.onKey(new KeyboardEvent('keydown', { key: ',' }));
    expect(component.tags).toEqual(['Spicy', 'Vegan']);

    component.startAdd();
    fixture.detectChanges();
    component.onKey(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(component.adding).toBe(false);
    expect(component.tags).toEqual(['Spicy', 'Vegan']);
  });

  it('commitAdd does nothing when not in adding mode', () => {
    spyOn(component.tagsChange, 'emit');
    component.commitAdd();
    expect(component.tagsChange.emit).not.toHaveBeenCalled();
  });
});

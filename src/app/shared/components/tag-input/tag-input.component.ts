import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

/**
 * Free-text tag editor for the save form: a bordered box of removable chips plus
 * an in-place "+ Create your own" entry. Tags are Title-cased and de-duped
 * (case-insensitive) so the eventual category-scoped suggestions stay clean.
 */
@Component({
  selector: 'app-tag-input',
  templateUrl: './tag-input.component.html',
  styleUrls: ['./tag-input.component.css']
})
export class TagInputComponent {
  @Input() tags: string[] = [];
  @Output() tagsChange = new EventEmitter<string[]>();

  /** Category-scoped suggestions (most-used first) + the category for the label. */
  @Input() suggestions: string[] = [];
  @Input() suggestionCategory: string | null = null;

  @ViewChild('tagInput') tagInput?: ElementRef<HTMLInputElement>;
  adding = false;

  startAdd(): void {
    this.adding = true;
    setTimeout(() => this.tagInput?.nativeElement.focus());
  }

  onKey(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.commitAdd();
    } else if (event.key === 'Escape') {
      this.adding = false;
    }
  }

  commitAdd(): void {
    if (!this.adding) {
      return;
    }
    const value = (this.tagInput?.nativeElement.value ?? '').trim();
    this.adding = false;
    this.addTag(value);
  }

  addTag(raw: string): void {
    const tag = this.titleCase(raw);
    if (!tag || this.tags.some(t => t.toLowerCase() === tag.toLowerCase())) {
      return;
    }
    this.tags = [...this.tags, tag];
    this.tagsChange.emit(this.tags);
  }

  removeChip(tag: string): void {
    this.tags = this.tags.filter(t => t !== tag);
    this.tagsChange.emit(this.tags);
  }

  /** Suggestions not already chosen (case-insensitive). */
  availableSuggestions(): string[] {
    const have = this.tags.map(t => t.toLowerCase());
    return this.suggestions.filter(s => !have.includes(s.toLowerCase()));
  }

  private titleCase(value: string): string {
    return value.trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }
}

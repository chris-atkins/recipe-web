import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { RatingStarsComponent } from './rating-stars.component';
import { RecipeService } from '../../../core/services/recipe.service';
import { UserService } from '../../../core/services/user.service';

describe('RatingStarsComponent', () => {
  let component: RatingStarsComponent;
  let fixture: ComponentFixture<RatingStarsComponent>;
  let recipeService: jasmine.SpyObj<RecipeService>;
  let userService: jasmine.SpyObj<UserService>;

  beforeEach(() => {
    recipeService = jasmine.createSpyObj('RecipeService', ['rateRecipe']);
    userService = jasmine.createSpyObj('UserService', ['isLoggedIn']);
    userService.isLoggedIn.and.returnValue(true);

    TestBed.configureTestingModule({
      declarations: [RatingStarsComponent],
      imports: [CommonModule],
      providers: [
        { provide: RecipeService, useValue: recipeService },
        { provide: UserService, useValue: userService }
      ]
    });
    fixture = TestBed.createComponent(RatingStarsComponent);
    component = fixture.componentInstance;
  });

  it('creates', () => {
    expect(component).toBeTruthy();
  });

  it('shows the average and count when there are ratings', () => {
    component.rating = { average: 4.3, count: 12 };
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.avg').textContent.trim()).toBe('4.3');
    expect(fixture.nativeElement.querySelector('.count').textContent).toContain('12');
    expect(fixture.nativeElement.querySelector('.not-rated')).toBeFalsy();
    expect(component.fillPercent).toBeCloseTo(86, 0);
  });

  it('shows "Not yet rated" when count is zero', () => {
    component.rating = { average: 0, count: 0 };
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.not-rated')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.avg')).toBeFalsy();
  });

  it('is display-only (no hit targets, no cue) when not interactive', () => {
    component.rating = { average: 4, count: 5 };
    component.interactive = false;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.stars-hits')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('.cue')).toBeFalsy();
  });

  it('prompts to log in when interactive but signed out', () => {
    userService.isLoggedIn.and.returnValue(false);
    component.rating = { average: 4, count: 5 };
    component.recipeId = 'r1';
    component.interactive = true;
    fixture.detectChanges();
    expect(component.canRate).toBe(false);
    expect(fixture.nativeElement.querySelector('.stars-hits')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('.cue').textContent).toContain('Log in to rate');
  });

  it('shows the rate cue + hit targets when interactive and signed in', () => {
    component.rating = { average: 4, count: 5 };
    component.recipeId = 'r1';
    component.interactive = true;
    fixture.detectChanges();
    expect(component.canRate).toBe(true);
    expect(fixture.nativeElement.querySelectorAll('.stars-hits button').length).toBe(5);
    expect(fixture.nativeElement.querySelector('.cue').textContent).toContain('Click a star to rate');
  });

  it('hover previews the prospective rating fill, reverting on leave', () => {
    component.rating = { average: 2, count: 5 };
    component.recipeId = 'r1';
    component.interactive = true;
    fixture.detectChanges();

    component.onHover(5);
    expect(component.fillPercent).toBe(100);
    component.onLeave();
    expect(component.fillPercent).toBe(40); // back to the average (2/5)
  });

  it('submits a rating and updates the display from the response', (done) => {
    recipeService.rateRecipe.and.returnValue(Promise.resolve({
      recipeName: 'x', recipeContent: 'y', rating: { average: 4.5, count: 6 }
    } as any));
    spyOn(component.ratingChange, 'emit');
    component.rating = { average: 4, count: 5 };
    component.recipeId = 'r1';
    component.interactive = true;
    fixture.detectChanges();

    component.rate(5);

    expect(recipeService.rateRecipe).toHaveBeenCalledWith('r1', 5);
    setTimeout(() => {
      expect(component.rating).toEqual({ average: 4.5, count: 6 });
      expect(component.justRated).toBe(5);
      expect(component.ratingChange.emit).toHaveBeenCalledWith({ average: 4.5, count: 6 });
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.cue').textContent).toContain('You rated 5');
      done();
    }, 10);
  });

  it('ignores rate clicks when rating is not allowed', () => {
    userService.isLoggedIn.and.returnValue(false);
    component.rating = { average: 4, count: 5 };
    component.recipeId = 'r1';
    component.interactive = true;
    component.rate(5);
    expect(recipeService.rateRecipe).not.toHaveBeenCalled();
  });

  it('invites the first rating when interactive + signed in but unrated', () => {
    component.rating = { average: 0, count: 0 };
    component.recipeId = 'r1';
    component.interactive = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.not-rated')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.cue').textContent).toContain('be the first');
  });

  it('cannot rate without a recipeId even when interactive + signed in', () => {
    component.rating = { average: 4, count: 5 };
    component.interactive = true; // recipeId intentionally left undefined
    expect(component.canRate).toBe(false);
  });

  it('does nothing on hover when rating is not allowed', () => {
    userService.isLoggedIn.and.returnValue(false);
    component.rating = { average: 2, count: 5 };
    component.recipeId = 'r1';
    component.interactive = true;
    component.onHover(5);
    expect(component.hoverValue).toBe(0);
    expect(component.fillPercent).toBe(40); // still the average
  });

  it('leaves the display unchanged if the rate request fails', (done) => {
    recipeService.rateRecipe.and.returnValue(Promise.reject('boom'));
    component.rating = { average: 4, count: 5 };
    component.recipeId = 'r1';
    component.interactive = true;
    fixture.detectChanges();

    component.rate(5);

    setTimeout(() => {
      expect(component.rating).toEqual({ average: 4, count: 5 });
      expect(component.justRated).toBe(0);
      done();
    }, 10);
  });

  it('keeps the prior rating if the response omits the aggregate', (done) => {
    recipeService.rateRecipe.and.returnValue(Promise.resolve({ recipeName: 'x', recipeContent: 'y' } as any));
    component.rating = { average: 4, count: 5 };
    component.recipeId = 'r1';
    component.interactive = true;
    fixture.detectChanges();

    component.rate(3);

    setTimeout(() => {
      expect(component.rating).toEqual({ average: 4, count: 5 });
      expect(component.justRated).toBe(3);
      done();
    }, 10);
  });
});

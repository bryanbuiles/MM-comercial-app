import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoteContainerComponent } from './quote-container-component';

describe('QuoteContainerComponent', () => {
  let component: QuoteContainerComponent;
  let fixture: ComponentFixture<QuoteContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuoteContainerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QuoteContainerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromptConsoleComponent } from './prompt-console.component';

describe('PromptConsoleComponent', () => {
  let component: PromptConsoleComponent;
  let fixture: ComponentFixture<PromptConsoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromptConsoleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PromptConsoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

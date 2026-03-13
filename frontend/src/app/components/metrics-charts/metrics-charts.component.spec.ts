import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetricsChartsComponent } from './metrics-charts.component';

describe('MetricsChartsComponent', () => {
  let component: MetricsChartsComponent;
  let fixture: ComponentFixture<MetricsChartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetricsChartsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MetricsChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

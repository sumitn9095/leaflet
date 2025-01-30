import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArcgisComponent } from './arcgis.component';

describe('ArcgisComponent', () => {
  let component: ArcgisComponent;
  let fixture: ComponentFixture<ArcgisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ArcgisComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArcgisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

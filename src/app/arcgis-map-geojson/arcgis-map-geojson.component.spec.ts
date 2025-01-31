import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArcgisMapGeojsonComponent } from './arcgis-map-geojson.component';

describe('ArcgisMapGeojsonComponent', () => {
  let component: ArcgisMapGeojsonComponent;
  let fixture: ComponentFixture<ArcgisMapGeojsonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArcgisMapGeojsonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArcgisMapGeojsonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

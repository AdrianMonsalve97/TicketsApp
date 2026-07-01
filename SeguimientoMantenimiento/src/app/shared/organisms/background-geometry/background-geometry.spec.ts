import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackgroundGeometry } from './background-geometry';

describe('BackgroundGeometry', () => {
  let component: BackgroundGeometry;
  let fixture: ComponentFixture<BackgroundGeometry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BackgroundGeometry],
    }).compileComponents();

    fixture = TestBed.createComponent(BackgroundGeometry);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

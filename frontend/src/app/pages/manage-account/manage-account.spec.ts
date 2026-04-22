import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageAccountComponent } from './manage-account';

describe('ManageAccountComponent', () => {
  let component: ManageAccountComponent;
  let fixture: ComponentFixture<ManageAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageAccountComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageAccountComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

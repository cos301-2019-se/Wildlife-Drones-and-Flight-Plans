import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminUpdaterPage } from './admin-updater.page';

describe('AdminUpdaterPage', () => {
  let component: AdminUpdaterPage;
  let fixture: ComponentFixture<AdminUpdaterPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminUpdaterPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminUpdaterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

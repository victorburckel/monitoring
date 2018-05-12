import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitoringDocumentListComponent } from './webservice-document-list.component';

describe('WebserviceDocumentListComponent', () => {
  let component: MonitoringDocumentListComponent;
  let fixture: ComponentFixture<MonitoringDocumentListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MonitoringDocumentListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonitoringDocumentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

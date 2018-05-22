import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebserviceDocumentViewDialogComponent } from './webservice-document-view-dialog.component';

describe('WebserviceDocumentViewDialogComponent', () => {
  let component: WebserviceDocumentViewDialogComponent;
  let fixture: ComponentFixture<WebserviceDocumentViewDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebserviceDocumentViewDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebserviceDocumentViewDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

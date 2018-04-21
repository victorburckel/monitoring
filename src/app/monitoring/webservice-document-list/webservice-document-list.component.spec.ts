import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebserviceDocumentListComponent } from './webservice-document-list.component';

describe('WebserviceDocumentListComponent', () => {
  let component: WebserviceDocumentListComponent;
  let fixture: ComponentFixture<WebserviceDocumentListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebserviceDocumentListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebserviceDocumentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

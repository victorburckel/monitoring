import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentViewDialogComponent } from './document-view-dialog.component';

describe('DocumentViewDialogComponent', () => {
  let component: DocumentViewDialogComponent;
  let fixture: ComponentFixture<DocumentViewDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentViewDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentViewDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

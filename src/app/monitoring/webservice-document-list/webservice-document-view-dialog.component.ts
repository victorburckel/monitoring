import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { WebServiceDocument } from '../monitoring-document';

@Component({
  selector: 'mon-webservice-document-view-dialog',
  templateUrl: './webservice-document-view-dialog.component.html',
  styles: []
})
export class WebserviceDocumentViewDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<WebserviceDocumentViewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { document: WebServiceDocument } ) { }

  ngOnInit() {
  }

}

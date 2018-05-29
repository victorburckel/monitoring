import { Component, OnInit, Inject, ViewChild, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import 'brace/mode/xml';
import 'brace/theme/textmate';

@Component({
  selector: 'mon-request-view-edit-dialog',
  templateUrl: './request-view-edit-dialog.component.html',
  styles: []
})
export class RequestViewEditDialogComponent implements OnInit {
  viewMode = true;
  requestEditorOptions = { useWorker: false };

  constructor(
    public dialogRef: MatDialogRef<RequestViewEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { request: string }) { }

  ngOnInit() {
  }

  toggleViewEditMode() {
    this.viewMode = !this.viewMode;
  }

  replayRequest() {
    console.log('replay');
  }

  isRequestValid(): boolean {
    const parser = new DOMParser();
    return parser.parseFromString(this.data.request, 'text/xml').getElementsByTagName('parsererror').length === 0;
  }
}

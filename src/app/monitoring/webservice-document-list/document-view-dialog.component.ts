import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'mon-document-view-dialog',
  templateUrl: './document-view-dialog.component.html',
  styles: []
})
export class DocumentViewDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<DocumentViewDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}

import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatTreeNestedDataSource, MatDialog } from '@angular/material';
import { WebServiceDocument, MonitoringDocument } from '../monitoring-document';
import { NestedTreeControl } from '@angular/cdk/tree';
import { of } from 'rxjs';
import { RequestViewEditDialogComponent } from './request-view-edit-dialog.component';

export class Node {
  name: string;
  value: string;
  children: Node[];
}

@Component({
  selector: 'mon-document-view-dialog',
  templateUrl: './document-view-dialog.component.html',
  styles: [`
  .example-tree-invisible {
    display: none;
  }
  .node-value {
    color: rgba(0,0,0,.54);
    text-align: right;
  }

  .example-tree ul,
  .example-tree li {
    margin-top: 0;
    margin-bottom: 0;
    list-style-type: none;
  }

  [mat-dialog-title] {
    cursor: move;
  }`]
})
export class DocumentViewDialogComponent implements OnInit {
  treeControl: NestedTreeControl<Node>;
  dataSource: MatTreeNestedDataSource<Node>;

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<DocumentViewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { document: MonitoringDocument } ) {
      this.treeControl = new NestedTreeControl<Node>(node => of(node.children));
      this.dataSource = new MatTreeNestedDataSource();
    }

  ngOnInit() {
    this.dataSource.data = this.buildPropertyTree(this.data.document, 0);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  buildPropertyTree(value: any, level: number): Node[] {
    const data: any[] = [];
    for (const k of Object.keys(value)) {
      const v = value[k];
      const node = new Node();
      node.name = `${k}`;
      if (v === null || v === undefined) {
        // no action
      } else if (typeof v === 'object') {
        node.children = this.buildPropertyTree(v, level + 1);
      } else {
        node.value = v;
      }
      data.push(node);
    }
    return data;
  }

  viewEditRequest() {
    this.dialog.open(RequestViewEditDialogComponent, {
      data: { request: (<any>this.data.document).request },
      minHeight: 300,
      minWidth: 600
    });
  }

  hasNestedChild = (_: number, node: Node) => !(node.value);

  isRequest = (_: number, node: Node) => node.name === 'request';
}

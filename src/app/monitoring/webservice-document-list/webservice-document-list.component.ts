import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatPaginator, MatSort, MatTable, MatDialog, MatSnackBar } from '@angular/material';
import { FormControl } from '@angular/forms';
import { MonitoringService, FieldDefinition, FieldType } from '../monitoring.service';
import { MonitoringDocument, WebServiceDocument } from '../monitoring-document';
import { Observable ,  merge, of } from 'rxjs';
import { startWith, switchMap, map, tap, debounceTime, catchError } from 'rxjs/operators';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { DocumentViewDialogComponent } from './document-view-dialog.component';


@Component({
  selector: 'mon-webservice-document-list',
  templateUrl: './webservice-document-list.component.html',
  styleUrls: ['./webservice-document-list.component.css']
})
export class MonitoringDocumentListComponent implements OnInit, AfterViewInit {
  availableColumns: FieldDefinition[];
  displayedColumns: string [];
  documents: MonitoringDocument[] = [];
  isLoadingResults = true;
  resultsLength = 0;

  displayedColumnsControl: FormControl;

  _FieldType = FieldType;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private monitoringService: MonitoringService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    public snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.availableColumns = this.monitoringService.fields();
    this.setDisplayedColumns(this.availableColumns
      .filter(x => ['client_application', 'submitted', 'ended', 'duration', 'status', 'operation'].includes(x.Name)));
    this.displayedColumnsControl = new FormControl(this.availableColumns.filter(x => this.displayedColumns.includes(x.RequestName)));

    this.displayedColumnsControl.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(() => this.setDisplayedColumns(this.displayedColumnsControl.value));
  }

  ngAfterViewInit() {
    merge(this.sort.sortChange, this.paginator.page, this.route.paramMap).pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults = true;
        return this.monitoringService.search(
          this.route.snapshot.paramMap.get('query'),
          this.sort.active,
          this.sort.direction,
          this.paginator.pageIndex,
          this.paginator.pageSize).pipe(
            catchError((e: HttpErrorResponse) => {
              let message = e.message;
              if (e.error && e.error.error &&
                e.error.error.root_cause && e.error.error.root_cause.length &&
                e.error.error.root_cause[0].reason) {
                message += ':\n' + e.error.error.root_cause[0].reason;
              }

              this.snackBar.open(message, null, { duration: 5000 });
              return of({ hits: [], total: 0 });
            })
          );
      }),
      map(data => {
        this.isLoadingResults = false;
        this.resultsLength = data.total;
        return data.hits;
      })).subscribe(data => this.documents = data, e => console.log(`error: ${e}`), () => console.log('completed'));
  }

  setDisplayedColumns(values: FieldDefinition[]): void {
    this.displayedColumns = values.map(x => x.RequestName).concat(['__view__', '__subdocuments__']);
  }

  viewRawDocument(element: MonitoringDocument): void {
    this.dialog.open(DocumentViewDialogComponent, {
      data: { document: element }
    });
  }

  viewSubDocuments(element: MonitoringDocument): void {
    const query = {
      filter: [
        { term: { _parentDocumentIds: element._id } }
      ]
    };
    this.router.navigate(['documentlist', { query: JSON.stringify(query) }]);
  }
}

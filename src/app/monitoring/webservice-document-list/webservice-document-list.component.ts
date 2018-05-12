import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import {MatPaginator, MatSort, MatTable} from '@angular/material';
import { FormControl } from '@angular/forms';
import { MonitoringService, FieldDefinition, FieldType } from '../monitoring.service';
import { WebServiceDocument } from '../monitoring-document';
import { Observable } from 'rxjs/Observable';
import { startWith, switchMap, map, tap, debounceTime, catchError } from 'rxjs/operators';
import 'rxjs/add/observable/of';
import { merge } from 'rxjs/observable/merge';
import { ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'mon-webservice-document-list',
  templateUrl: './webservice-document-list.component.html',
  styleUrls: ['./webservice-document-list.component.css']
})
export class WebserviceDocumentListComponent implements OnInit, AfterViewInit {
  availableColumns: FieldDefinition[];
  displayedColumns: string [];
  documents: WebServiceDocument[] = [];
  isLoadingResults = true;
  resultsLength = 0;

  displayedColumnsControl: FormControl;

  _FieldType = FieldType;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private monitoringService: MonitoringService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.availableColumns = this.monitoringService.fields();
    this.displayedColumns = this.availableColumns
      .filter(x => ['client_application', 'submitted', 'ended', 'duration', 'status', 'operation'].includes(x.Name))
      .map(x => x.RequestName);
    this.displayedColumnsControl = new FormControl(this.availableColumns.filter(x => this.displayedColumns.includes(x.RequestName)));

    this.displayedColumnsControl.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(() => this.displayedColumns = this.displayedColumnsControl.value.map( x => x.RequestName));
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
          this.paginator.pageSize);
      }),
      catchError(() => {
        return Observable.of({ total: 0, hits: [] });
      }),
      map(data => {
        this.isLoadingResults = false;
        this.resultsLength = data.total;
        return data.hits;
      })).subscribe(data => this.documents = data);
  }
}

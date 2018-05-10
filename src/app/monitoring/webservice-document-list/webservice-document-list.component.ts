import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import {MatPaginator, MatSort, MatTable} from '@angular/material';
import { FormControl } from '@angular/forms';
import { MonitoringService, ColumnDefinition, ColumnType } from '../monitoring.service';
import { WebServiceDocument } from '../monitoring-document';
import { startWith, switchMap, map, tap, debounceTime } from 'rxjs/operators';
import { merge } from 'rxjs/observable/merge';

@Component({
  selector: 'mon-webservice-document-list',
  templateUrl: './webservice-document-list.component.html',
  styleUrls: ['./webservice-document-list.component.css']
})
export class WebserviceDocumentListComponent implements OnInit, AfterViewInit {
  availableColumns: ColumnDefinition[];
  displayedColumns = ['client_application', 'submitted', 'ended', 'duration', 'status', 'operation'];
  documents: WebServiceDocument[] = [];
  isLoadingResults = true;
  resultsLength = 0;

  displayedColumnsControl: FormControl;

  get sortColumn(): ColumnDefinition {
    if (this.sort.active) {
      return this.availableColumns.find(x => x.Name === this.sort.active);
    }

    return undefined;
  }

  _ColumnType = ColumnType;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private monitoringService: MonitoringService) { }

  ngOnInit() {
    this.availableColumns = this.monitoringService.columns();
    this.displayedColumnsControl = new FormControl(this.availableColumns.filter(x => this.displayedColumns.includes(x.Name)));

    this.displayedColumnsControl.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(() => this.displayedColumns = this.displayedColumnsControl.value.map( x => x.Name));
  }

  ngAfterViewInit() {
    merge(this.sort.sortChange, this.paginator.page).pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults = true;
        return this.monitoringService.search(
          this.sortColumn, this.sort.direction, this.paginator.pageIndex, this.paginator.pageSize);
      }),
      map(data => {
        this.isLoadingResults = false;
        this.resultsLength = data.total;
        return data.hits;
      })).subscribe(data => this.documents = data);
  }
}

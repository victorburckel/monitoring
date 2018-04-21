import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import {MatPaginator, MatTableDataSource, MatSort, MatTable} from '@angular/material';
import { MonitoringService } from '../monitoring.service';
import { WebServiceDocument } from '../monitoring-document';

@Component({
  selector: 'mon-webservice-document-list',
  templateUrl: './webservice-document-list.component.html',
  styleUrls: ['./webservice-document-list.component.css']
})
export class WebserviceDocumentListComponent implements OnInit, AfterViewInit {

  displayedColumns = ['client_application', 'submitted', 'ended', 'duration', 'status', 'operation'];
  dataSource = new MatTableDataSource<WebServiceDocument>();
  isLoadingResults = true;
  resultsLength = 0;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private monitoringService: MonitoringService) { }

  ngOnInit() {
    this.monitoringService.search('').subscribe(docs => {
      this.resultsLength = docs.length;
      this.dataSource.data = docs;
      this.isLoadingResults = false;
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}

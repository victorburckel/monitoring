import { Injectable } from '@angular/core';
import { WebServiceDocument, PricingDocument } from './monitoring-document';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/delay';

@Injectable()
export class MonitoringService {

  constructor() { }

  search(term: string): Observable<WebServiceDocument[]> {
    return Observable.of(webServiceDocuments).delay(1000);
  }

  get(id: string): WebServiceDocument {
    return webServiceDocuments.find(doc => doc.id === id);
  }

  getSubDocuemnts(id: string): PricingDocument[] {
    return pricingDocuments.filter(doc => doc.parentDocumentId = id);
  }

  mapping(): ColumnDefinition[] {
    return [
      { Name: 'id', DisplayName: 'Id', Type: ColumnType.String },
      { Name: 'parentDocumentIdid', DisplayName: 'Parent Document', Type: ColumnType.String },
      { Name: 'submitted', DisplayName: 'Submitted', Type: ColumnType.Date },
      { Name: 'ended', DisplayName: 'Ended', Type: ColumnType.Date },
      { Name: 'duration', DisplayName: 'Duration', Type: ColumnType.Duration },
      { Name: 'status', DisplayName: 'Status', Type: ColumnType.String },
      { Name: 'service', DisplayName: 'Service', Type: ColumnType.String },
      { Name: 'operation', DisplayName: 'Operation', Type: ColumnType.String },
      { Name: 'client_application', DisplayName: 'Client Application', Type: ColumnType.String },
      { Name: 'client_hostname', DisplayName: 'Client Hostname', Type: ColumnType.String },
      { Name: 'input_size', DisplayName: 'Input Size', Type: ColumnType.StoreSize },
      { Name: 'output_size', DisplayName: 'Output Size', Type: ColumnType.StoreSize },
    ];
  }

  listValues(term: string): Observable<string[]> {
    if (term === 'client_application') {
      return Observable.of(['IWF', 'Cascade', 'MLP']).delay(1000);
    } else if (term === 'client_hostname') {
      return Observable.of(['MyHost', 'LocalHost', 'Workstation']).delay(2000);
    }

    return Observable.of([]);
  }

}

export enum ColumnType {
  String,
  Date,
  Duration,
  StoreSize
}

export interface ColumnDefinition {
  Name: string;
  DisplayName: string;
  Type: ColumnType;
}

const webServiceDocuments: WebServiceDocument[] = [
  {
    id: '1',
    parentDocumentId: undefined,
    submitted: new Date('2018-04-21T15:50:00'),
    ended: new Date('2018-04-21T15:50:15'),
    duration: 15000,
    status: 'success',
    service: 'Pricing',
    operation: 'price',
    client_application: 'my-appli',
    client_hostname: 'my-host',
    input_size: 100,
    output_size: 200
  }
];

const pricingDocuments: PricingDocument[] = [
  {
    id: '10',
    parentDocumentId: '1',
    submitted: new Date('2018-04-21T15:50:10'),
    ended: new Date('2018-04-21T15:50:14'),
    duration: 4000,
    status: 'success',
    pricer: 'Grid',
    sessionId: 50,
    taskId: 100
  }
];

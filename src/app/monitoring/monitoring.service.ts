import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import { WebServiceDocument, PricingDocument } from './monitoring-document';

@Injectable()
export class MonitoringService {

  constructor(private http: HttpClient) { }

  private url = 'http://localhost:9200';

  search(sortColumn: string, sortOrder: string, pageIndex: number, pageSize: number)
  : Observable<{ total: number, hits: WebServiceDocument[] }> {
    const query: any = {
      from: pageIndex * pageSize,
      size: pageSize,
    };

    if (sortColumn) {
      const sortCriteria = {};
      sortCriteria[`${sortColumn}.keyword`] = { order: sortOrder };
      query.sort = sortCriteria;
    }

    return this.http.post<any>(`${this.url}/monitoring/_search`, query)
      .map(x => ({
        total: x.hits.total,
        hits: x.hits.hits.map(h => h._source)
      }));
  }

  columns(): ColumnDefinition[] {
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

  terms(column: string): Observable<string[]> {
    const query = {
      aggs: {
        agg: {
          terms: { field: column }
        }
      }
    };
    return this.http.post<any>(`${this.url}/monitoring/_search`, query)
      .do(x => console.log(x))
      .map(x => x.result);
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

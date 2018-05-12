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

  search(q: any, sortColumn: string, sortOrder: string, pageIndex: number, pageSize: number)
  : Observable<{ total: number, hits: WebServiceDocument[] }> {
    const query: any = {
      from: pageIndex * pageSize,
      size: pageSize,
    };

    if (q) {
      query['query'] = { bool: JSON.parse(q) };
    }

    if (sortColumn && sortOrder) {
      const sortCriteria = {};
      sortCriteria[sortColumn] = { order: sortOrder };
      query.sort = sortCriteria;
    }

    return this.http.post<any>(`${this.url}/monitoring/_search`, query)
      .map(x => ({
        total: x.hits.total,
        hits: x.hits.hits.map(h => {
          const doc = h._source;
          doc._id = h._id;
          return doc;
        })
      }));
  }

  fields(): FieldDefinition[] {
    return [
      { Name: 'submitted', RequestName: 'submitted', DisplayName: 'Submitted', Type: FieldType.Date },
      { Name: 'ended', RequestName: 'ended', DisplayName: 'Ended', Type: FieldType.Date },
      { Name: 'duration', RequestName: 'duration', DisplayName: 'Duration', Type: FieldType.Duration },
      { Name: 'status', RequestName: 'status.keyword', DisplayName: 'Status', Type: FieldType.String },
      { Name: 'service', RequestName: 'service.keyword', DisplayName: 'Service', Type: FieldType.String },
      { Name: 'operation', RequestName: 'operation.keyword', DisplayName: 'Operation', Type: FieldType.String },
      { Name: 'client_application', RequestName: 'client_application.keyword', DisplayName: 'Client Application', Type: FieldType.String },
      { Name: 'client_hostname', RequestName: 'client_hostname.keyword', DisplayName: 'Client Hostname', Type: FieldType.String },
      { Name: 'input_size', RequestName: 'input_size', DisplayName: 'Input Size', Type: FieldType.StoreSize },
      { Name: 'output_size', RequestName: 'output_size', DisplayName: 'Output Size', Type: FieldType.StoreSize },
      { Name: 'error', RequestName: 'error.keyword', DisplayName: 'Error', Type: FieldType.String },
      { Name: 'after_send_error', RequestName: 'after_send_error.keyword', DisplayName: 'After Send Error', Type: FieldType.String },
    ];
  }

  terms(column: string): Observable<string[]> {
    const query = {
      aggs: {
        agg: {
          terms: { field: column }
        }
      },
      size: 0
    };
    return this.http.post<any>(`${this.url}/monitoring/_search`, query)
      .map(x => x.aggregations.agg.buckets.map(a => a.key));
  }

}

export enum FieldType {
  String,
  Date,
  Duration,
  StoreSize
}

export interface FieldDefinition {
  Name: string;
  RequestName: string;
  DisplayName: string;
  Type: FieldType;
}

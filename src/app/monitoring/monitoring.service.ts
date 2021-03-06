import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


import { WebServiceDocument, PricingDocument } from './monitoring-document';

@Injectable()
export class MonitoringService {

  constructor(private http: HttpClient) { }

  private url = 'http://localhost:9200';
  private monitoring = 'monitoring';

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

    return this.http.post<any>(`${this.url}/${this.monitoring}/_search`, query).pipe(
      map(x => ({
        total: x.hits.total,
        hits: x.hits.hits.map(h => {
          const doc = h._source;
          doc._id = h._id;
          return doc;
        })
      })));
  }

  fields(): FieldDefinition[] {
    const keywordSuffix = '.keyword';

    return [
      {
        Name: 'submitted',
        RequestName: 'submitted',
        DisplayName: 'Submitted',
        Type: FieldType.Date },
      {
        Name: 'ended',
        RequestName: 'ended',
        DisplayName: 'Ended',
        Type: FieldType.Date },
      {
        Name: 'duration',
        RequestName: 'duration',
        DisplayName: 'Duration',
        Type: FieldType.Duration },
      {
        Name: 'status',
        RequestName: `status${keywordSuffix}`,
        DisplayName: 'Status',
        Type: FieldType.String },
      {
        Name: 'service',
        RequestName: `service${keywordSuffix}`,
        DisplayName: 'Service',
        Type: FieldType.String },
      {
        Name: 'operation',
        RequestName: `operation${keywordSuffix}`,
        DisplayName: 'Operation',
        Type: FieldType.String },
      {
        Name: 'client_application',
        RequestName: `client_application${keywordSuffix}`,
        DisplayName: 'Client Application',
        Type: FieldType.String },
      {
        Name: 'client_hostname',
        RequestName: `client_hostname${keywordSuffix}`,
        DisplayName: 'Client Hostname',
        Type: FieldType.String },
      {
        Name: 'input_size',
        RequestName: 'input_size',
        DisplayName: 'Input Size',
        Type: FieldType.StoreSize },
      {
        Name: 'output_size',
        RequestName: 'output_size',
        DisplayName: 'Output Size',
        Type: FieldType.StoreSize },
      {
        Name: 'error',
        RequestName: `error${keywordSuffix}`,
        DisplayName: 'Error',
         Type: FieldType.String },
      {
        Name: 'after_send_error',
        RequestName: `after_send_error${keywordSuffix}`,
        DisplayName: 'After Send Error',
        Type: FieldType.String },
      {
        Name: 'type',
        RequestName: 'type${keywordSuffix}',
        DisplayName: 'Type',
        Type: FieldType.String }
    ];
  }

  terms(column: string, size = 100): Observable<string[]> {
    const query = {
      aggs: {
        agg: {
          terms: { field: column, size: size }
        }
      },
      size: 0
    };
    return this.http.post<any>(`${this.url}/${this.monitoring}/_search`, query).pipe(
      map(x => x.aggregations.agg.buckets.map(a => a.key)));
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

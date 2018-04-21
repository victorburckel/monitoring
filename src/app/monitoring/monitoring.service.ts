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

}

const webServiceDocuments: WebServiceDocument[] = [
  {
    id: '1',
    parentDocumentId: undefined,
    submitted: new Date('2018-04-21T15:50:00'),
    started: new Date('2018-04-21T15:50:10'),
    ended: new Date('2018-04-21T15:50:15'),
    duration: 15000,
    status: 'success',
    service: 'Pricing',
    operation: 'price',
    client_application: 'my-appli',
    client_hostname: 'my-host'
  }
];

const pricingDocuments: PricingDocument[] = [
  {
    id: '10',
    parentDocumentId: '1',
    submitted: new Date('2018-04-21T15:50:10'),
    started: new Date('2018-04-21T15:50:11'),
    ended: new Date('2018-04-21T15:50:14'),
    duration: 4000,
    status: 'success',
    pricer: 'Grid',
    sessionId: 50,
    taskId: 100
  }
];

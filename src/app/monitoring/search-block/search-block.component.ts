import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ColumnType, MonitoringService, ColumnDefinition } from '../monitoring.service';
import { Observable } from 'rxjs/Observable';
import { startWith, map, switchMap, tap } from 'rxjs/operators';
import 'rxjs/add/observable/defer';
import 'rxjs/add/observable/combineLatest';

@Component({
  selector: 'mon-search-block',
  templateUrl: './search-block.component.html',
  styles: []
})
export class SearchBlockComponent implements OnInit {
  columnSelectionControl = new FormControl();
  includeExcludeSelectionControl = new FormControl();
  requestTypeSelectionControl = new FormControl();
  termSelectionControl = new FormControl();
  dateFromSelectionControl = new FormControl();
  dateToSelectionControl = new FormControl();

  columns: ColumnDefinition[];
  terms: Observable<string[]>;
  filteredTerms: Observable<string[]>;

  _ColumnType = ColumnType;

  constructor(private monitoringService: MonitoringService) { }

  ngOnInit() {
    this.columns = this.monitoringService.mapping();

    this.terms = Observable.defer(() => this.columnSelectionControl.valueChanges.pipe(
      startWith(this.columnSelectionControl.value),
      switchMap(field => this.monitoringService.listValues(field)),
    ));

    this.filteredTerms = Observable.combineLatest(
      this.terms,
      this.termSelectionControl.valueChanges.pipe(startWith('')),
      (terms, value) => ({ Terms: terms, Value: value })
    ).pipe(
      map(x => x.Terms.filter(term => term.toLowerCase().indexOf(x.Value.toLowerCase()) === 0))
    );
  }

  getColumnType(): ColumnType {
    if (this.columnSelectionControl.value) {
      return this.columns.find(x => x.Name === this.columnSelectionControl.value).Type;
    }

    return undefined;
  }
}

import { Component, OnInit } from '@angular/core';
import { MonitoringService, ColumnDefinition, ColumnType } from '../monitoring.service';
import { startWith, map, switchMap, tap } from 'rxjs/operators';
import 'rxjs/add/observable/defer';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/map';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'mon-search-request',
  templateUrl: './search-request.component.html',
  styles: []
})
export class SearchRequestComponent implements OnInit {
  searchForm: FormGroup;

  columns: ColumnDefinition[];
  terms: Observable<string[]>;
  filteredTerms: Observable<string[]>;

  get columnSelectionControl(): FormControl { return <FormControl>this.searchForm.get('column'); }
  get includeExcludeSelectionControl(): FormControl { return <FormControl>this.searchForm.get('includeExclude'); }
  get requestTypeSelectionControl(): FormControl { return <FormControl>this.searchForm.get('requestType'); }
  get termSelectionControl(): FormControl { return <FormControl>this.searchForm.get('term'); }
  get dateFromSelectionControl(): FormControl { return <FormControl>this.searchForm.get('dateFrom'); }
  get dateToSelectionControl(): FormControl { return <FormControl>this.searchForm.get('dateTo'); }

  _ColumnType = ColumnType;

  constructor(private fb: FormBuilder, private monitoringService: MonitoringService) { }

  ngOnInit() {
    this.searchForm = this.fb.group({
      column: '',
      includeExclude: '',
      requestType: '',
      term: '',
      dateFrom : '',
      dateTo: ''
    });

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

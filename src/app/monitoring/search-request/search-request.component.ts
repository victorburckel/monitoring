import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, FormArray, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { startWith, map, switchMap, tap } from 'rxjs/operators';
import 'rxjs/add/observable/defer';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/filter';
import { ColumnDefinition, MonitoringService, ColumnType } from '../monitoring.service';

@Component({
  selector: 'mon-search-request',
  templateUrl: './search-request.component.html',
  styles: []
})
export class SearchRequestComponent implements OnInit {
  searchForm: FormGroup;
  availableColumns: ColumnDefinition[];
  terms: Observable<string[]>[] = [];
  filteredTerms: Observable<string[]>[] = [];

  _ColumnType = ColumnType;

  get queryBlocks(): FormArray {
    return <FormArray>this.searchForm.get('queryBlocks');
  }

  constructor(private monitoringService: MonitoringService, private fb: FormBuilder) {
    this.availableColumns = this.monitoringService.columns();
  }

  ngOnInit() {
    this.searchForm = this.fb.group({
      queryBlocks: this.fb.array([])
    });
    this.addQueryBlock();
  }

  buildQueryBlock(): FormGroup {
    return this.fb.group({
      column: [ '', [Validators.required] ],
      includeExclude: [ '', [Validators.required] ],
      requestType: [ '', [ Validators.required ] ],
      term: '',
      dateRange: this.fb.group({
        from: '',
        to: ''
      })
    });
  }

  control(name: string, index: number): FormControl {
    return <FormControl>this.queryBlocks.at(index).get(name);
  }

  addQueryBlock(): void {
    this.queryBlocks.push(this.buildQueryBlock());

    const index = this.queryBlocks.length - 1;

    this.terms.push(Observable.defer(() => this.control('column', index).valueChanges.pipe(
      startWith(this.control('column', index).value),
      switchMap(field => this.monitoringService.terms(field)),
    )));

    this.filteredTerms.push(Observable.combineLatest(
      this.terms[index],
      this.control('term', index).valueChanges.pipe(startWith('')),
      (terms, value) => ({ Terms: terms, Value: value })
    ).pipe(
      map(x => x.Terms.filter(term => term.toLowerCase().indexOf(x.Value.toLowerCase()) === 0))
    ));

    this.control('requestType', index).valueChanges.subscribe(x => this.setRequestType(x, index));
  }

  removeQueryBlock(index: number) {
    this.terms.splice(index, 1);
    this.filteredTerms.splice(index, 1);
    this.queryBlocks.removeAt(index);
  }

  getColumnType(index: number): ColumnType {
    if (this.control('column', index).value) {
      return this.availableColumns.find(x => x.Name === this.control('column', index).value).Type;
    }

    return undefined;
  }

  setRequestType(requestType: string, index: number) {
    this.control('term', index).clearValidators();
    this.control('dateRange', index).clearValidators();

    switch (requestType) {
      case 'term':
      this.control('term', index).setValidators(Validators.required);
      break;
      case 'range':
      this.control('dateRange', index).setValidators([
          Validators.required,
           dateRangeValidation(this.control('dateRange.from', index), this.control('dateRange.to', index))]);
        break;
    }

    this.control('term', index).updateValueAndValidity();
    this.control('dateRange', index).updateValueAndValidity();
  }

  search() {
    console.log('search');
  }
}

function dateRangeValidation(dateFromSelectionControl: AbstractControl, dateToSelectionControl: AbstractControl): ValidatorFn {
  return () => {
    if (dateFromSelectionControl.value >= dateToSelectionControl.value) {
      return { 'range': true };
    }

    return null;
  };
}

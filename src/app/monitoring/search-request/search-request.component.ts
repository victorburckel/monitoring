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

  addQueryBlock(): void {
    const queryBlock = this.buildQueryBlock();
    this.queryBlocks.push(queryBlock);

    const terms = Observable.defer(() => queryBlock.get('column').valueChanges.pipe(
      startWith(queryBlock.get('column').value),
      switchMap(field => this.monitoringService.terms(field)),
    ));

    this.filteredTerms.push(Observable.combineLatest(
      terms,
      queryBlock.get('term').valueChanges.pipe(startWith('')),
      (t, v) => ({ Terms: t, Value: v })
    ).pipe(
      map(x => x.Terms.filter(term => term.toLowerCase().indexOf(x.Value.toLowerCase()) === 0))
    ));

    queryBlock.get('requestType').valueChanges.subscribe(x => this.setRequestType(x, queryBlock));
  }

  removeQueryBlock(index: number) {
    this.filteredTerms.splice(index, 1);
    this.queryBlocks.removeAt(index);
  }

  control(name: string, index: number): FormControl {
    return <FormControl>this.queryBlocks.at(index).get(name);
  }

  getColumnType(index: number): ColumnType {
    if (this.control('column', index).value) {
      return this.availableColumns.find(x => x.Name === this.control('column', index).value).Type;
    }

    return undefined;
  }

  setRequestType(requestType: string, queryBlock: FormGroup) {
    queryBlock.get('term').clearValidators();
    queryBlock.get('dateRange').clearValidators();

    switch (requestType) {
      case 'term':
      queryBlock.get('term').setValidators(Validators.required);
      break;
      case 'range':
      queryBlock.get('dateRange').setValidators([
          Validators.required,
           dateRangeValidation(queryBlock.get('dateRange.from'), queryBlock.get('dateRange.to'))]);
        break;
    }

    queryBlock.get('term').updateValueAndValidity();
    queryBlock.get('dateRange').updateValueAndValidity();
  }

  toJSON(): any {
    const result = {
      must: [],
      must_not: []
    };

    for (const queryBlock of this.queryBlocks.controls) {
      const q = {};

      const requestType = queryBlock.get('requestType').value;
      if (requestType === 'term') {
        q[queryBlock.get('column').value] = queryBlock.get('term').value;
      } else if (requestType === 'range') {
        q[queryBlock.get('column').value] = {
          gt: queryBlock.get('dateRange.from').value,
          lt: queryBlock.get('dateRange.to').value,
        };
      } else if (requestType === 'exists') {
        q['field'] = queryBlock.get('column').value;
      }

      const query = {};
      query[queryBlock.get('requestType').value] = q;
      if (queryBlock.get('includeExclude').value === 'must') {
        result.must.push(query);
      } else {
        result.must_not.push(query);
      }
    }

    return result;
  }

  search() {
    console.log(this.toJSON());
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

import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormBuilder,
  FormArray,
  Validators,
  AbstractControl,
  ValidatorFn,
  FormGroupDirective,
  NgForm,
  ValidationErrors
} from '@angular/forms';
import { Observable, defer, of, combineLatest } from 'rxjs';
import { startWith, map, switchMap, tap, filter, catchError } from 'rxjs/operators';

import { FieldDefinition, MonitoringService, FieldType } from '../monitoring.service';
import { Router } from '@angular/router';
import { MatTabGroup, ErrorStateMatcher } from '@angular/material';
import 'brace/mode/json';
import 'brace/theme/textmate';

@Component({
  selector: 'mon-search-request',
  templateUrl: './search-request.component.html',
  styles: [`
  .example-full-width {
    width: 100%;
  }
  `]
})
export class SearchRequestComponent implements OnInit {
  searchForm: FormGroup;
  availableColumns: FieldDefinition[];
  filteredTerms: { values: Observable<string[]>, isLoading: boolean, isInError: boolean }[] = [];
  dateRangeErrorMatcher = new RangeErrorMatcher('daterange');
  timeRangeErrorMatcher = new RangeErrorMatcher('timerange');

  rawText: string;

  _FieldType = FieldType;

  rawEditorOptions = { useWorker: false };

  get queryBlocks(): FormArray {
    return <FormArray>this.searchForm.get('queryBlocks');
  }

  constructor(private monitoringService: MonitoringService, private fb: FormBuilder, private router: Router) {
    this.availableColumns = this.monitoringService.fields();
  }

  ngOnInit() {
    this.searchForm = this.fb.group({
      queryBlocks: this.fb.array([])
    });
    this.addQueryBlock();
  }

  buildQueryBlock(): FormGroup {
    return this.fb.group({
      field: [ '', [Validators.required] ],
      includeExclude: [ '', [Validators.required] ],
      requestType: [ '', [ Validators.required ] ],
      term: '',
      dateRange: this.fb.group({
        from: this.fb.group({
          date: '',
          time: ''
        }),
        to: this.fb.group({
          date: '',
          time: ''
        })
      })
    });
  }

  addQueryBlock(): void {
    const queryBlock = this.buildQueryBlock();
    this.queryBlocks.push(queryBlock);

    const filteredTerms = {
      isLoading: false,
      isInError: false,
      values: undefined
    };

    const terms = defer(() => queryBlock.get('field').valueChanges.pipe(
      startWith(queryBlock.get('field').value),
      filter((field: FieldDefinition) => field.Type === FieldType.String),
      switchMap((field: FieldDefinition) => {
        filteredTerms.isLoading = true;
        filteredTerms.isInError = false;
        return this.monitoringService.terms(field.RequestName).pipe(
          catchError(() => {
            filteredTerms.isInError = true;
            return of(<string[]>[]);
          }),
          tap(() => filteredTerms.isLoading = false)
        );
      })
    ));

    filteredTerms.values = combineLatest(
      terms,
      queryBlock.get('term').valueChanges.pipe(startWith('')),
      (t, v) => ({ Terms: t, Value: v })
    ).pipe(
      map(x => x.Terms.filter(term => term.toLowerCase().indexOf(x.Value.toLowerCase()) === 0))
    );

    this.filteredTerms.push(filteredTerms);

    queryBlock.get('requestType').valueChanges.subscribe(x => this.setRequestType(x, queryBlock));
  }

  removeQueryBlock(index: number) {
    this.filteredTerms.splice(index, 1);
    this.queryBlocks.removeAt(index);
  }

  control(name: string, index: number): FormControl {
    return <FormControl>this.queryBlocks.at(index).get(name);
  }

  setRequestType(requestType: string, queryBlock: FormGroup) {
    queryBlock.get('term').clearValidators();
    queryBlock.get('dateRange').clearValidators();

    switch (requestType) {
      case 'term':
        queryBlock.get('term').setValidators(Validators.required);
        break;
      case 'range':
        queryBlock.get('dateRange.from').setValidators(dateTimeValidation);
        queryBlock.get('dateRange.to').setValidators(dateTimeValidation);
        queryBlock.get('dateRange').setValidators(dateTimeRangeValidation);
        break;
    }

    queryBlock.get('term').updateValueAndValidity();
    queryBlock.get('dateRange').updateValueAndValidity();
  }

  isRawTextValid(): boolean {
    try {
      JSON.parse(this.rawText);
      return true;
    } catch {
      return false;
    }
  }

  minDate(index: number) {
    return this.control('dateRange.dateFrom', index).value;
  }

  maxDate(index: number) {
    return this.control('dateRange.dateTo', index).value;
  }

  toJSON(): any {
    const result = {
      filter: [],
      must_not: []
    };

    for (const queryBlock of this.queryBlocks.controls) {
      const query: QueryBlock = {};

      const requestType = queryBlock.get('requestType').value;
      const field = queryBlock.get('field').value.RequestName;

      if (requestType === 'term') {
        query.term = {};
        query.term[field] = queryBlock.get('term').value;
      } else if (requestType === 'range') {
        query.range = {};
        query.range[field] = {};
        const from = queryBlock.get('dateRange.from.date').value;
        if (from) {
          query.range[field].gt = new Date(from.getTime() + getTimeInSeconds(queryBlock.get('dateRange.from.time').value));
        }
        const to = queryBlock.get('dateRange.to.date').value;
        if (to) {
          query.range[field].lt = new Date(from.getTime() + getTimeInSeconds(queryBlock.get('dateRange.to.time').value));
        }
      } else if (requestType === 'exists') {
        query.exists = {
          field: field
        };
      }

      if (queryBlock.get('includeExclude').value === 'must') {
        result.filter.push(query);
      } else {
        result.must_not.push(query);
      }
    }

    return result;
  }

  importFromQueryBuilder() {
    this.rawText = JSON.stringify(this.toJSON(), null, 4);
  }

  search() {
    this.router.navigate(['/documentlist', { query: JSON.stringify(this.toJSON()) }]);
  }

  rawSearch() {
    this.router.navigate(['/documentlist', { query: this.rawText }]);
  }
}

function dateTimeRangeValidation(c: AbstractControl): ValidationErrors | null {
  const group = <FormGroup>c;
  const dateFrom = group.get('from.date');
  const dateTo = group.get('to.date');
  const timeFrom = group.get('from.time');
  const timeTo = group.get('to.time');

  if (dateFrom.value && dateTo.value) {
    if (dateFrom.value > dateTo.value) {
      return { 'daterange': true };
    }

    if (dateFrom.value.valueOf() === dateTo.value.valueOf() && timeFrom.value > timeTo.value) {
      return { 'timerange': true };
    }
  }

  return null;
}

function getTimeInSeconds(time: string): number {
  const splitted = time.split(':');
  return splitted.reduce((acc, t) => (60 * acc) + +t, 0) * (splitted.length === 2 ? 60 : 1 ) * 1000;
}

function dateTimeValidation(c: AbstractControl): ValidationErrors | null {
  const group = <FormGroup>c;
  const date = group.get('date');
  const time = group.get('time');

  if (time.value && !date.value) {
    return { 'datetime': true };
  }

  return null;
}

class RangeErrorMatcher implements ErrorStateMatcher {
  constructor(private errorCode: string) {
  }

  isErrorState(control: FormControl, form: FormGroupDirective | NgForm): boolean {
    return !!(control && (control.dirty || control.touched) &&
      (control.parent.parent.hasError(this.errorCode) || control.parent.hasError('datetime')));
  }
}

export interface TermQuery {
  [key: string]: string;
}

export interface RangeQuery {
  [key: string]: {
    gt?: any;
    lt?: any;
  };
}

export interface ExistsQuery {
  field: string;
}

export interface QueryBlock {
  term?: TermQuery;
  range?: RangeQuery;
  exists?: ExistsQuery;
}

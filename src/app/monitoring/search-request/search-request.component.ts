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
  NgForm
} from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { startWith, map, switchMap, tap } from 'rxjs/operators';
import 'rxjs/add/observable/defer';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/filter';
import { FieldDefinition, MonitoringService, FieldType } from '../monitoring.service';
import { Router } from '@angular/router';
import { MatTabGroup, ErrorStateMatcher } from '@angular/material';

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
  rawSearchForm: FormGroup;
  availableColumns: FieldDefinition[];
  filteredTerms: Observable<string[]>[] = [];
  dateRangeErrorMatcher = new DateRangeErrorMatch();

  _FieldType = FieldType;

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

    this.rawSearchForm = this.fb.group({
      query: [ '', jsonValidation ]
    });
  }

  buildQueryBlock(): FormGroup {
    return this.fb.group({
      field: [ '', [Validators.required] ],
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

    const terms = Observable.defer(() => queryBlock.get('field').valueChanges.pipe(
      startWith(queryBlock.get('field').value),
      switchMap((field: FieldDefinition) => this.monitoringService.terms(field.RequestName)),
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

  parseQueryBlock(query: QueryBlock, includeExclude: string) {
    const getFieldByRequestName = x => this.availableColumns.find(column => column.RequestName === x);

    if (query.term) {
      return {
        field: getFieldByRequestName(Object.keys(query.term)[0]),
        includeExclude: includeExclude,
        requestType: 'term',
        term: query.term[Object.keys(query.term)[0]]
      };
    } else if (query.range) {
      return {
        field: getFieldByRequestName(Object.keys(query.range)[0]),
        includeExclude: includeExclude,
        requestType: 'range',
        range: {
          lt: query.range[Object.keys(query.range)[0]].lt,
          gt: query.range[Object.keys(query.range)[0]].gt
        }
      };
    } else if (query.exists) {
      return {
        field: getFieldByRequestName(query.exists.field),
        includeExclude: includeExclude,
        requestType: 'exists',
      };
    }

    return {};
  }

  fromJSON(json: any) {
    while (this.queryBlocks.controls.length) {
      this.queryBlocks.removeAt(0);
    }

    const values: any[] = [];
    if (json.filter) {
      for (const filter of json.filter) {
        this.addQueryBlock();
        values.push(this.parseQueryBlock(filter, 'must'));
      }
    }

    if (json.must_not) {
      for (const must_not of json.must_not) {
        this.addQueryBlock();
        values.push(this.parseQueryBlock(must_not, 'must_not'));
      }
    }

    this.queryBlocks.patchValue(values);
  }

  importFromRawView() {
    this.fromJSON(JSON.parse(this.rawSearchForm.get('query').value));
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
        if (queryBlock.get('dateRange.from').value) {
          query.range[field].gt = queryBlock.get('dateRange.from').value;
        }
        if (queryBlock.get('dateRange.to').value) {
          query.range[field].lt = queryBlock.get('dateRange.to').value;
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
    this.rawSearchForm.get('query').setValue(JSON.stringify(this.toJSON(), null, 4));
  }

  search() {
    this.router.navigate(['/documentlist', { query: JSON.stringify(this.toJSON()) }]);
  }

  rawSearch() {
    this.router.navigate(['/documentlist', { query: this.rawSearchForm.get('query').value }]);
  }
}

function dateRangeValidation(from: AbstractControl, to: AbstractControl): ValidatorFn {
  return () => {
    if (from.value && to.value && from.value >= to.value) {
      return { 'range': true };
    }

    return null;
  };
}

class DateRangeErrorMatch implements ErrorStateMatcher {
  isErrorState(control: FormControl, form: FormGroupDirective | NgForm): boolean {
    return !!(control && (control.dirty || control.touched) && control.parent.errors);
  }
}

function jsonValidation(c: AbstractControl): {[key: string]: boolean} | null  {
  if (c.value) {
    try {
        JSON.parse(c.value);
    } catch (e) {
        return { 'json': e };
    }
  }

  return null;
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

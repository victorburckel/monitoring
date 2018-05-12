import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, FormArray, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { startWith, map, switchMap, tap } from 'rxjs/operators';
import 'rxjs/add/observable/defer';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/filter';
import { FieldDefinition, MonitoringService, FieldType } from '../monitoring.service';
import { Router } from '@angular/router';
import { MatTabGroup } from '@angular/material';

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
    this.addQueryBlock({});

    this.rawSearchForm = this.fb.group({
      query: ['', jsonValidation]
    });
  }

  buildQueryBlock(values: {}): FormGroup {
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

  addQueryBlock(values: any): void {
    const queryBlock = this.buildQueryBlock(values);
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
    if (query.term) {
      return {
        field: Object.keys(query.term)[0],
        includeExclude: includeExclude,
        requestType: 'term',
        term: query.term[Object.keys(query.term)[0]]
      };
    } else if (query.range) {
      return {
        field: Object.keys(query.range)[0],
        includeExclude: includeExclude,
        requestType: 'range',
        range: {
          lt: query.range[Object.keys(query.range)[0]].lt,
          gt: query.range[Object.keys(query.range)[0]].gt
        }
      };
    } else if (query.exists) {
      return {
        field: query.exists.field,
        includeExclude: includeExclude,
        requestType: 'exists',
      };
    }

    return {};
  }

  fromJSON(json: any) {
    for (const filter of json.filter) {
      this.addQueryBlock(this.parseQueryBlock(filter, 'must'));
    }

    for (const must_not of json.must_not) {
      this.addQueryBlock(this.parseQueryBlock(must_not, 'must_not'));
    }
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
        query.range[field] = {
          gt: queryBlock.get('dateRange.from').value,
          lt: queryBlock.get('dateRange.to').value
        };
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

  search() {
    this.router.navigate(['/documentlist', { query: JSON.stringify(this.toJSON()) }]);
  }

  rawSearch() {
    this.router.navigate(['/documentlist', { query: this.rawSearchForm.get('query').value }]);
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

function jsonValidation(c: AbstractControl): {[key: string]: boolean} | null  {
  try {
      JSON.parse(c.value);
  } catch (e) {
      return { 'json': e };
  }

  return null;
}

export interface TermQuery {
  [key: string]: string;
}

export interface RangeQuery {
  [key: string]: {
    gt: any;
    lt: any;
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

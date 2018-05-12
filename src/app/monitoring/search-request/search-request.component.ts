import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, FormArray, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { startWith, map, switchMap, tap } from 'rxjs/operators';
import 'rxjs/add/observable/defer';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/filter';
import { FieldDefinition, MonitoringService, FieldType } from '../monitoring.service';
import { Router } from '@angular/router';

@Component({
  selector: 'mon-search-request',
  templateUrl: './search-request.component.html',
  styles: []
})
export class SearchRequestComponent implements OnInit {
  searchForm: FormGroup;
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

  toJSON(): any {
    const result = {
      filter: [],
      must_not: []
    };

    for (const queryBlock of this.queryBlocks.controls) {
      const q = {};

      const requestType = queryBlock.get('requestType').value;
      const field = queryBlock.get('column').value.RequestName;

      if (requestType === 'term') {
        q[field] = queryBlock.get('term').value;
      } else if (requestType === 'range') {
        q[field] = {
          gt: queryBlock.get('dateRange.from').value,
          lt: queryBlock.get('dateRange.to').value,
        };
      } else if (requestType === 'exists') {
        q['field'] = field;
      }

      const query = {};
      query[queryBlock.get('requestType').value] = q;
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
}

function dateRangeValidation(dateFromSelectionControl: AbstractControl, dateToSelectionControl: AbstractControl): ValidatorFn {
  return () => {
    if (dateFromSelectionControl.value >= dateToSelectionControl.value) {
      return { 'range': true };
    }

    return null;
  };
}

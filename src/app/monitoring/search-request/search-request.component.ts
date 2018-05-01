import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, FormArray } from '@angular/forms';

@Component({
  selector: 'mon-search-request',
  templateUrl: './search-request.component.html',
  styles: []
})
export class SearchRequestComponent implements OnInit {
  searchForm: FormGroup;

  get queryBlocks(): FormArray {
    return <FormArray>this.searchForm.get('queryBlocks');
  }

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.searchForm = this.fb.group({
      queryBlocks: this.fb.array([this.buildQueryBlock()])
    });
  }

  buildQueryBlock(): FormGroup {
    return this.fb.group({});
  }

  addQueryBlock(): void {
    this.queryBlocks.push(this.buildQueryBlock());
  }

  removeQueryBlock(index: number) {
    this.queryBlocks.removeAt(index);
  }

  search() {
    console.log('search');
  }
}

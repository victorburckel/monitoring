import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {
  MatExpansionModule,
  MatTableModule,
  MatPaginatorModule,
  MatSortModule,
  MatFormFieldModule,
  MatInput,
  MatSpinner,
  MatProgressSpinnerModule,
  MatCardModule,
  MatAutocompleteModule,
  MatDatepickerModule,
  MatButtonModule,
  MatIconModule,
  MatSelectModule,
  MatNativeDateModule,
  MatChipsModule,
  MatToolbarModule} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { WebserviceDocumentListComponent } from './monitoring/webservice-document-list/webservice-document-list.component';
import { MonitoringService } from './monitoring/monitoring.service';
import { DurationPipe } from './shared/duration.pipe';
import { SearchRequestComponent } from './monitoring/search-request/search-request.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SearchBlockComponent } from './monitoring/search-block/search-block.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    WebserviceDocumentListComponent,
    DurationPipe,
    MatInput,
    SearchRequestComponent,
    SearchBlockComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatExpansionModule,
    BrowserAnimationsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatNativeDateModule,
    FormsModule,
    ReactiveFormsModule,
    MatChipsModule,
    MatToolbarModule,
    HttpClientModule
  ],
  providers: [MonitoringService],
  bootstrap: [AppComponent]
})
export class AppModule { }

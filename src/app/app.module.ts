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
  MatToolbarModule,
  MatDialogModule} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { MonitoringDocumentListComponent } from './monitoring/webservice-document-list/webservice-document-list.component';
import { MonitoringService } from './monitoring/monitoring.service';
import { DurationPipe } from './shared/duration.pipe';
import { SearchRequestComponent } from './monitoring/search-request/search-request.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { StoreSizePipe } from './shared/store-size.pipe';
import { DocumentViewDialogComponent } from './monitoring/webservice-document-list/document-view-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    MonitoringDocumentListComponent,
    DurationPipe,
    MatInput,
    SearchRequestComponent,
    StoreSizePipe,
    DocumentViewDialogComponent
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
    MatToolbarModule,
    HttpClientModule,
    MatDialogModule
  ],
  providers: [MonitoringService],
  entryComponents: [DocumentViewDialogComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }

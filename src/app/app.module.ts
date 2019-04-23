import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {DragDropModule, CdkDrag} from '@angular/cdk/drag-drop';
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
  MatDialogModule,
  MatTabsModule,
  MatSnackBarModule} from '@angular/material';
import { MatTreeModule } from '@angular/material/tree';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AceEditorModule } from 'ng2-ace-editor';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { MonitoringDocumentListComponent } from './monitoring/monitoring-document-list/monitoring-document-list.component';
import { MonitoringService } from './monitoring/monitoring.service';
import { DurationPipe } from './shared/duration.pipe';
import { SearchRequestComponent } from './monitoring/search-request/search-request.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { StoreSizePipe } from './shared/store-size.pipe';
import { DocumentViewDialogComponent } from './monitoring/monitoring-document-list/document-view-dialog.component';
import { RequestViewEditDialogComponent } from './monitoring/monitoring-document-list/request-view-edit-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    MonitoringDocumentListComponent,
    DurationPipe,
    MatInput,
    SearchRequestComponent,
    StoreSizePipe,
    DocumentViewDialogComponent,
    RequestViewEditDialogComponent
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
    MatDialogModule,
    MatTabsModule,
    MatSnackBarModule,
    MatTreeModule,
    AceEditorModule,
    DragDropModule
  ],
  providers: [MonitoringService],
  entryComponents: [
    DocumentViewDialogComponent,
    RequestViewEditDialogComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

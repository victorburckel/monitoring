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
  MatProgressSpinnerModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { WebserviceDocumentListComponent } from './monitoring/webservice-document-list/webservice-document-list.component';
import { MonitoringService } from './monitoring/monitoring.service';
import { DurationPipe } from './shared/duration.pipe';


@NgModule({
  declarations: [
    AppComponent,
    WebserviceDocumentListComponent,
    DurationPipe,
    MatInput,
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
    MatProgressSpinnerModule
  ],
  providers: [MonitoringService],
  bootstrap: [AppComponent]
})
export class AppModule { }

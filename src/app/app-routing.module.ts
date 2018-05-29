import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MonitoringDocumentListComponent } from './monitoring/monitoring-document-list/monitoring-document-list.component';

const routes: Routes = [
  { path: 'documentlist', component: MonitoringDocumentListComponent },
  { path: '', pathMatch: 'full', redirectTo: 'documentlist'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

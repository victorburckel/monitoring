import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WebserviceDocumentListComponent } from './monitoring/webservice-document-list/webservice-document-list.component';
import { SearchRequestComponent } from './monitoring/search-request/search-request.component';

const routes: Routes = [
  { path: 'documentlist', component: WebserviceDocumentListComponent },
  { path: 'searchform', component: SearchRequestComponent },
  { path: '', pathMatch: 'full', redirectTo: 'documentlist'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

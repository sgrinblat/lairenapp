import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PanelusuarioPage } from './panelusuario.page';

const routes: Routes = [
  {
    path: '',
    component: PanelusuarioPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PanelusuarioPageRoutingModule {}

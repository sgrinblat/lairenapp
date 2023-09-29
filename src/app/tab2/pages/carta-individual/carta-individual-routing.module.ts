import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CartaIndividualPage } from './carta-individual.page';

const routes: Routes = [
  {
    path: '',
    component: CartaIndividualPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CartaIndividualPageRoutingModule {}

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DecklistIndividualPage } from './decklist-individual.page';

const routes: Routes = [
  {
    path: '',
    component: DecklistIndividualPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DecklistIndividualPageRoutingModule {}

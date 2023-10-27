import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Tab3Page } from './tab3.page';

const routes: Routes = [
  {
    path: '',
    component: Tab3Page,
  },
  {
    path: 'decklist',
    loadChildren: () => import('./pages/decklist-individual/decklist-individual.module').then( m => m.DecklistIndividualPageModule)
  },
  {
    path: 'decklist-individual',
    loadChildren: () => import('./pages/decklist-individual/decklist-individual.module').then( m => m.DecklistIndividualPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Tab3PageRoutingModule {}

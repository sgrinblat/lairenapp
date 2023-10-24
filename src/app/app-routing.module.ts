import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { CartaIndividualPageModule } from './tab2/pages/carta-individual/carta-individual.module';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'buscador/cartas/:id',
    loadChildren: () => import('./tab2/pages/carta-individual/carta-individual.module').then(m => m.CartaIndividualPageModule)
  },
  {
    path: 'decklist/:id',
    loadChildren: () => import('./tab3/pages/decklist-individual/decklist-individual.module').then(m => m.DecklistIndividualPageModule)
  },

];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}

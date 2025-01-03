import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { CalendarPageModule } from '../calendar/calendar.module';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'tab1',
        children: [
          {
            path: '',
            loadChildren: () => import('../tab1/tab1.module').then(m => m.Tab1PageModule)
          },
          {
            path: 'noticias/:id',
            loadChildren: () => import('../tab1/pages/entrada/entrada.module').then(m => m.EntradaPageModule)
          }
        ]

      },
      {
        path: 'life-counter',
        loadChildren: () => import('../life-counter/life-counter.module').then(m => m.LifeCounterPageModule)
      },
      {
        path: 'calendar',
        loadChildren: () => import('../calendar/calendar.module').then(m => m.CalendarPageModule)
      },
      {
        path: 'tab2',
        children: [
          {
            path: '',
            loadChildren: () => import('../tab2/tab2.module').then(m => m.Tab2PageModule)
          },
          {
            path: 'carta/:id',
            loadChildren: () => import('../tab2/pages/carta-individual/carta-individual.module').then(m => m.CartaIndividualPageModule)
          },
          {
            path: 'glosario',
            loadChildren: () => import('../tab2/pages/glosario/glosario.module').then(m => m.GlosarioPageModule)
          }
        ]
      },

      {
        path: 'tab3',
        children: [
          {
            path: '',
            loadChildren: () => import('../tab3/tab3.module').then(m => m.Tab3PageModule)
          },
          {
            path: 'decklist/:id',
            loadChildren: () => import('../tab3/pages/decklist-individual/decklist-individual.module').then(m => m.DecklistIndividualPageModule)
          }
        ]
      },



      {
        path: '',
        redirectTo: '/tabs/tab1',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/tab1',
    pathMatch: 'full'
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LifeCounterPage } from './life-counter.page';

const routes: Routes = [
  {
    path: '',
    component: LifeCounterPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LifeCounterPageRoutingModule {}

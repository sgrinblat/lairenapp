import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LifeCounterPageRoutingModule } from './life-counter-routing.module';

import { LifeCounterPage } from './life-counter.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LifeCounterPageRoutingModule
  ],
  declarations: [LifeCounterPage]
})
export class LifeCounterPageModule {}

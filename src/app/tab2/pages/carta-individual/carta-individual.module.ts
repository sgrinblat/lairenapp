import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CartaIndividualPageRoutingModule } from './carta-individual-routing.module';

import { CartaIndividualPage } from './carta-individual.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CartaIndividualPageRoutingModule
  ],
  declarations: [CartaIndividualPage]
})
export class CartaIndividualPageModule {}

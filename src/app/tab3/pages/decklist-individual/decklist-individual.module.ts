import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DecklistIndividualPageRoutingModule } from './decklist-individual-routing.module';

import { DecklistIndividualPage } from './decklist-individual.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DecklistIndividualPageRoutingModule
  ],
  declarations: [DecklistIndividualPage]
})
export class DecklistIndividualPageModule {}

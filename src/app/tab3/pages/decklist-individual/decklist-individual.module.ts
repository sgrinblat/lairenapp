import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DecklistIndividualPageRoutingModule } from './decklist-individual-routing.module';

import { DecklistIndividualPage } from './decklist-individual.page';
import { ImageGeneratorComponent } from './image-generator/image-generator.component';
import { ImageBovedaDeckComponent } from './image-boveda-deck/image-boveda-deck.component';
import { ImageSidedeckComponent } from './image-sidedeck/image-sidedeck.component';
import { SelectSubtypesModalComponent } from 'src/app/select-subtypes-modal/select-subtypes-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DecklistIndividualPageRoutingModule
  ],
  declarations: [
    DecklistIndividualPage,
    ImageGeneratorComponent,
    ImageBovedaDeckComponent,
    ImageSidedeckComponent
  ]
})
export class DecklistIndividualPageModule {}

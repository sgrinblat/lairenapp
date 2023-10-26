import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PanelusuarioPageRoutingModule } from './panelusuario-routing.module';

import { PanelusuarioPage } from './panelusuario.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PanelusuarioPageRoutingModule
  ],
  declarations: [PanelusuarioPage]
})
export class PanelusuarioPageModule {}

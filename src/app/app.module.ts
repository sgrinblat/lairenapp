import { RouteReuseStrategy } from '@angular/router';
import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import localeEs from '@angular/common/locales/es';
import { IonicModule, IonicRouteStrategy, ModalController } from '@ionic/angular';

import { IonicStorageModule } from '@ionic/storage-angular'; // Importar Ionic Storage

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { authInterceptorProviders } from './services/auth.interceptor';
import { SelectSubtypesModalComponent } from './select-subtypes-modal/select-subtypes-modal.component';

registerLocaleData(localeEs);

@NgModule({
  declarations: [AppComponent, SelectSubtypesModalComponent],
  imports: [
    BrowserModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot() // Configurar Ionic Storage
  ],
  exports: [
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, authInterceptorProviders],
  bootstrap: [AppComponent],
})
export class AppModule {}

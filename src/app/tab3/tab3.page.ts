import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Decklist } from '../objetos/decklist';
import { Usuario } from '../objetos/usuario';
import { ConexionService } from '../services/conexion.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  decklists: Decklist[];
  tieneDecks: boolean = false;
  defaultImage = '../../assets/fondos/mente-mejor.jpg';


  constructor(private conexion: ConexionService, private activatedRoute: ActivatedRoute,
    private route: Router, private alertController: AlertController, private cdr: ChangeDetectorRef,) {}

  usuarioLogeado: boolean = false;  // Variable para rastrear si hay un usuario logeado

  ionViewWillEnter() {
    this.conexion.getUsuarioActual().subscribe((usuario: Usuario) => {
      if (usuario && usuario.id) {  // Verifica si el objeto usuario y su id existen
        this.usuarioLogeado = true;  // Actualiza la variable a true si hay un usuario logeado
        this.obtenerDecklists(usuario.id);
      } else {
        this.usuarioLogeado = false;
      }
    }, error => {
      this.usuarioLogeado = false;  // Actualiza la variable a false si ocurre un error
    });
  }

  obtenerDecklists(id: number) {
    this.conexion.getTodasLasDecklistsDeJugador(id).subscribe((dato) => {
      this.decklists = dato;
      this.cdr.detectChanges();
      if(this.decklists.length < 1) {
        this.tieneDecks = false;
      } else {
        this.tieneDecks = true;
      }
    });
  }

  crearDeck() {
    this.route.navigate(['/tabs/tab3/decklist']);
  }

  editarDecklist(deck: Decklist) {
    this.route.navigate(['/tabs/tab3/decklist', deck.id]);
  }

  eliminarDecklist(deck: Decklist) {
    // Crear y presentar el alerta de confirmación
    this.alertController.create({
      header: 'Confirmación',
      message: '¿Estás seguro de que quieres eliminar esta decklist?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Eliminación cancelada');
          }
        },
        {
          text: 'Eliminar',
          handler: () => {
            // Solo procede con la eliminación si el usuario confirma
            this.conexion.deleteDecklist(deck.id).subscribe(
              async (dato) => {
                this.conexion.getUsuarioActual().subscribe((usuario: Usuario) => {
                  this.obtenerDecklists(usuario.id);
                });
                const alert = await this.alertController.create({
                  header: 'Eliminado',
                  message: 'La decklist ha sido eliminada.',
                  buttons: ['OK'],
                  cssClass: 'my-custom-class',
                });
                await alert.present();
              },
              (error) => {
                console.log("Error al eliminar: ", error);
              }
            );
          }
        }
      ]
    }).then(alertElem => alertElem.present());
  }




}

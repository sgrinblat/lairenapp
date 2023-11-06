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

  usuarioLogeado: boolean = false;  // Variable para rastrear si hay un usuario logueado

  /**
   * Si hay un usuario logueado, busca si tiene decklists almacenadas en la base de datos asociadas a ese usuario
   */
  ionViewWillEnter() {
    this.conexion.getUsuarioActual().subscribe((usuario: Usuario) => {
      if (usuario && usuario.id) {  // Verifica si el objeto usuario y su id existen
        this.usuarioLogeado = true;  // Actualiza la variable a true si hay un usuario logueado
        this.obtenerDecklists(usuario.id);
      } else {
        this.usuarioLogeado = false;
      }
    }, error => {
      this.usuarioLogeado = false;  // Actualiza la variable a false si ocurre un error
    });
  }

  /**
   * Busca las decklists del usuario logueado
   * @param id id del jugador logueado
   */
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

  /**
   * Redirige al componente para crear una decklist
   */
  crearDeck() {
    this.route.navigate(['/tabs/tab3/decklist']);
  }

  /**
   * Redirige al componente para actualizar una decklist
   * @param deck Objeto de decklist que se recupera del front para tocar el botón de editar
   */
  editarDecklist(deck: Decklist) {
    this.route.navigate(['/tabs/tab3/decklist', deck.id]);
  }

  /**
   * Elimina una decklist
   * @param deck Objeto de decklist que se recupera del front para tocar el botón de eliminar
   */
  eliminarDecklist(deck: Decklist) {
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

import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
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


  constructor(private conexion: ConexionService, private activatedRoute: ActivatedRoute, private route: Router, private alertController: AlertController) {}

  usuarioLogeado: boolean = false;  // Variable para rastrear si hay un usuario logeado

  ngOnInit() {
    this.conexion.getUsuarioActual().subscribe((usuario: Usuario) => {
      if (usuario && usuario.id) {  // Verifica si el objeto usuario y su id existen
        this.usuarioLogeado = true;  // Actualiza la variable a true si hay un usuario logeado
        this.obtenerDecklists(usuario.id);
      } else {
        this.usuarioLogeado = false;  // Actualiza la variable a false si no hay un usuario logeado
        // Aquí puedes también actualizar el mensaje en el front para informar que no hay un usuario logeado
      }
    }, error => {
      this.usuarioLogeado = false;  // Actualiza la variable a false si ocurre un error
      // Opcionalmente, maneja el error (ej., mostrar un mensaje de error en la UI)
      console.error('Error obteniendo el usuario actual:', error);
    });
  }

  obtenerDecklists(id: number) {
    this.conexion.getTodasLasDecklistsDeJugador(id).subscribe((dato) => {
      this.decklists = dato;
      if(this.decklists.length < 1) {
        this.tieneDecks = false;
      } else {
        this.tieneDecks = true;
      }
    });
  }


  editarDecklist(deck: Decklist) {
    this.route.navigate(['/tabs/tab3/decklist', deck.id]);
  }

  eliminarDecklist(deck: Decklist) {
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
      (error) => console.log("Qué estás buscando, picaron?")
    );
  }



}

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


  constructor(private conexion: ConexionService, private activatedRoute: ActivatedRoute, private route: Router, private alertController: AlertController) {

  }

  ngOnInit() {

    this.conexion.getUsuarioActual().subscribe((usuario: Usuario) => {
      this.obtenerDecklists(usuario.id);
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

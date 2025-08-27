import { Component, OnInit, ElementRef, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';


import { ConexionService } from '../../../services/conexion.service';
import { Carta } from '../../../objetos/carta';


@Component({
  selector: 'app-carta-individual',
  templateUrl: './carta-individual.page.html',
  styleUrls: ['./carta-individual.page.scss'],
})
export class CartaIndividualPage implements OnInit {
  id: number;
  carta: Carta = new Carta();

  constructor(
    private conexion: ConexionService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  /**
   * Renderiza la info de una carta especifica en el front
   */
  ngOnInit(): void {
  this.id = this.route.snapshot.params['id'];

  this.conexion.getCartaByIdPublic(this.id).subscribe(
    (dato: Carta) => {
      // seteamos src local al inicio
      this.carta = {
        ...dato,
        imageSrc: this.getLocalPath(dato) || this.getPlaceholder(),
        _triedRemote: false
      };
    },
    (error) => console.log(error),
    () => {}
  );
}

// Ruta local (ajustá carpeta/extensión si hace falta)
getLocalPath(card: Carta): string {
  const fileName = `${encodeURIComponent(card.nombreCarta)}.webp`;
  return `assets/decklists/${fileName}`;
}

getPlaceholder(): string {
  return `assets/images/placeholder.webp`;
}

// Fallback: local → remota → placeholder
onImageError(card: Carta): void {
  if (!card._triedRemote && card.urlImagen) {
    card._triedRemote = true;
    card.imageSrc = card.urlImagen;
    return;
  }
  card.imageSrc = this.getPlaceholder();
}


  visualizarCarta() {
    this.router.navigate(['/tabs/tab1']);
    setTimeout(() => {
      console.log("Delayed for 0.1 second.");
      this.router.navigate(['/tabs/tab2']);
    }, 100); // 100 milisegundos
  }


}

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
      (dato) => {
        this.carta = dato;
      },
      (error) => console.log(error),
      () => {}
    );
  }
}

import { Component, OnInit, ElementRef, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { ConexionService } from '../../../services/conexion.service';
import { Carta } from '../../../objetos/carta';
import { Rareza } from '../../../objetos/rareza';
import { Expansion } from '../../../objetos/expansion';
import { Tipo } from '../../../objetos/tipo';

@Component({
  selector: 'app-carta-individual',
  templateUrl: './carta-individual.page.html',
  styleUrls: ['./carta-individual.page.scss'],
})
export class CartaIndividualPage implements OnInit {

  id: number;
  cartas!: Carta[];
  expansiones: Observable<Expansion[]>;
  rarezas: Observable<Rareza[]>;
  tipos: Observable<Tipo[]>;

  carta: Carta = new Carta();
  expansion: Expansion = new Expansion();
  rareza: Rareza = new Rareza();
  tipo: Tipo = new Tipo();

  esverdad : boolean = false;

  constructor(private conexion: ConexionService, private router: Router, private route: ActivatedRoute) { }

  /**
   * Renderiza la info de una carta especifica en el front
   */
  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    this.expansiones = this.conexion.getTodasLasExpas();
    this.rarezas = this.conexion.getTodasLasRarezas();
    this.tipos = this.conexion.getTodasLosTipos();

    this.conexion.getCartaByIdPublic(this.id).subscribe(dato =>{
      this.carta = dato;
    }, error => console.log(error), () => {
        this.esverdad = true;
      }
    );
  }



}

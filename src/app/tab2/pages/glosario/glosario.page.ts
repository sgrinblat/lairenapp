import { Component, OnInit, ElementRef, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';


import { ConexionService } from '../../../services/conexion.service';
import { Carta } from '../../../objetos/carta';
import { Glosario } from 'src/app/objetos/glosario';


@Component({
  selector: 'app-glosario',
  templateUrl: './glosario.page.html',
  styleUrls: ['./glosario.page.scss'],
})
export class GlosarioPage implements OnInit {
  glosarios: Glosario[] = [];
  glosariosFiltrados: Glosario[] = [];
  palabraFiltro: string = '';

  constructor(private conexion: ConexionService) {}

  ngOnInit(): void {
    this.conexion.getTodosLosKeywords().subscribe(
      (data: Glosario[]) => {
        this.glosarios = data;
        this.glosariosFiltrados = data; // Inicializa con todos los eventos
      },
      error => {
        //console.error('Error al obtener eventos', error);
      }
    );
  }

  ngOnChanges(): void {
    this.filtrarPorNombre();
  }

  filtrarPorNombre(): void {
    if (!this.palabraFiltro) {
      this.glosariosFiltrados = this.glosarios;
    } else {
      this.glosariosFiltrados = this.glosarios.filter(keyword =>
        keyword.keywordNombre.toUpperCase().includes(this.palabraFiltro.toUpperCase())
      );
    }
  }
}

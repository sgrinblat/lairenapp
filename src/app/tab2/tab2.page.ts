import { Component, OnInit, ElementRef, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { ConexionService } from '../services/conexion.service';
import { Carta } from '../objetos/carta';
import { Rareza } from '../objetos/rareza';
import { Expansion } from '../objetos/expansion';
import { Tipo } from '../objetos/tipo';


@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  searchText: string | null = null;
  selectedRareza: number | null = null;
  selectedExpansion: number | null = null;
  selectedTipo: number | null = null;
  selectedCoste: number | null = null;
  filteredCartas: Carta[] = [];
  cartas!: Carta[];
  expansiones: Observable<Expansion[]>;
  rarezas: Rareza[] = [];
  tipos: Tipo[] = [];
  costes: number[] = [];
  cantidadDeCartasMostrandose: number;

  constructor(private conexion: ConexionService, private activatedRoute: ActivatedRoute, private route: Router, private renderer: Renderer2) {}

  /**
   * Obtiene de la base de datos:
   * Todas las cartas, tipos, expansiones y rarezas (las rarezas las ordena de una forma especifica)
   */
  ngOnInit(): void {
    this.obtenerCartas();
    this.expansiones = this.conexion.getTodasLasExpas();

    this.conexion.getTodasLasRarezas().pipe(
      map(rarezas => {
        const order = ['BRONCE', 'PLATA', 'ORO', 'DIAMANTE', 'ESMERALDA'];
        return rarezas.sort((a, b) => order.indexOf(a.nombreRareza) - order.indexOf(b.nombreRareza));
      })
    ).subscribe(rarezas => {
      this.rarezas = rarezas;
    });


    this.conexion.getTodasLosTipos().pipe(
      map(tipos => tipos.sort((a, b) => a.nombreTipo.localeCompare(b.nombreTipo)))
    ).subscribe(tipos => {
      this.tipos = tipos;
    });
  }

  /**
   * Filtro de cartas según el nombre de la carta
   */
  searchByText() {
    this.filteredCartas = this.cartas.filter(carta => {
      if(carta.nombreCarta.includes(this.searchText)) {
        return true;
      } else {
        return false;
      }
    });
  }

  /**
   * Busca una carta especifica en la base de datos para renderizarla en otro componente
   * @param id id de la carta
   */
  visualizarCarta(id: number) {
    this.route.navigate(['/tabs/tab2/carta', id]);
  }

  /**
   * Toma el texto de la carta y lo recorta para mostrarlo en el front
   * @param texto texto de la carta
   * @param limite cantidad de chars a mostrar en el front
   * @returns el texto de la carta recortado
   */
  acortarTexto(texto: string, limite: number = 35): string {
    if (texto.length <= limite) {
      return texto;
    }
    return `${texto.substr(0, limite)}...`;
  }


  /**
   * Filtra las cartas acorde a la rareza seleccionada
   * @param selectedRareza id de la rareza seleccionada
   */
  onRarezaChange(selectedRareza: number) {
    this.selectedRareza = selectedRareza;
    if(this.selectedRareza == 0) {
      this.selectedRareza = null;
    }
    this.filterCartas();
    this.cantidadDeCartasMostrandose = this.filteredCartas.length;
  }

  /**
   * Filtra las cartas acorde a la expansión seleccionada
   * @param selectedExpansion id de la expansión seleccionada
   */
  onExpansionChange(selectedExpansion: number) {
    this.selectedExpansion = selectedExpansion;
    if(this.selectedExpansion == 0) {
      this.selectedExpansion = null;
    }
    this.filterCartas();
    this.cantidadDeCartasMostrandose = this.filteredCartas.length;
  }

  /**
   * Filtra las cartas acorde al tipo de carta seleccionado
   * @param selectedTipo id del tipo de carta seleccionado
   */
  onTipoChange(selectedTipo: number) {
    this.selectedTipo = selectedTipo;
    if(this.selectedTipo == 0) {
      this.selectedTipo = null;
    }
    this.filterCartas();
    this.cantidadDeCartasMostrandose = this.filteredCartas.length;
  }

  /**
   * Filtra las cartas acorde al coste de la carta seleccionado
   * @param selectedCoste número de coste seleccionado
   */
  onCosteChange(selectedCoste: number) {
    this.selectedCoste = selectedCoste;
    if(this.selectedCoste == 0) {
      this.selectedCoste = null;
    }
    this.filterCartas();
    this.cantidadDeCartasMostrandose = this.filteredCartas.length;
  }


  /**
   * Chequea cuántos filtros han sido seleccionados en simúltaneo, y va filtrando cartas acorde a ello
   */
  filterCartas() {
    this.filteredCartas = this.cartas.filter(carta => {
      // Comprobación de si cada filtro está establecido (no '0' que es nuestro valor para 'Deseleccionar').
      let matchesExpansion = this.selectedExpansion === null || carta.expansion.idExpansion === this.selectedExpansion;
      let matchesRareza = this.selectedRareza === null || carta.rareza.idRareza === this.selectedRareza;
      let matchesTipo = this.selectedTipo === null || carta.tipo.idTipo === this.selectedTipo;
      let matchesCoste = this.selectedCoste === null || carta.costeCarta === this.selectedCoste;

      // Solo aplica los filtros que están activamente seleccionados.
      return (!this.selectedExpansion || matchesExpansion) &&
            (!this.selectedRareza || matchesRareza) &&
            (!this.selectedTipo || matchesTipo) &&
            (!this.selectedCoste || matchesCoste);
    });
  }

  /**
   * Recupera todas las cartas de la base de datos
   */
  obtenerCartas() {
    this.conexion.getTodasLasCartasOrdenadas().subscribe((dato) => {
      this.cartas = dato;
      this.costes = this.getUniqueCostesCartas(this.cartas);
      this.costes = this.costes.sort((a, b) => b - a);
    });
  }

  /**
   * De todas las cartas recuperadas, se observa los costes de las mismas para armar así el filtro de costes
   * @param cartas objeto recuperado de cartas de la base de datos
   * @returns lista numérica de cuantos costes existen
   */
  getUniqueCostesCartas(cartas: Carta[]): number[] {
    let costes: number[] = cartas.map(carta => carta.costeCarta);
    let uniqueCostes: number[] = [...new Set(costes)];
    return uniqueCostes;
  }

}

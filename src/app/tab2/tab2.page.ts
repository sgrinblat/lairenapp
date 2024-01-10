import { Component, OnInit, ElementRef, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { ConexionService } from '../services/conexion.service';
import { Carta } from '../objetos/carta';
import { Rareza } from '../objetos/rareza';
import { Expansion } from '../objetos/expansion';
import { Tipo } from '../objetos/tipo';
import { Subtipo } from '../objetos/subtipo';


@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  searchName: string | null = null;
  searchText: string | null = null;
  selectedRareza: number | null = null;
  selectedExpansion: number | null = null;
  selectedTipo: number | null = null;
  selectedSubTipo: number | null = null;
  selectedSubTipo2: number | null = null;
  selectedSubTipo3: number | null = null;
  selectedCoste: number | null = null;
  filteredCartas: Carta[] = [];
  cartas!: Carta[];
  expansiones: Observable<Expansion[]>;
  rarezas: Rareza[] = [];
  tipos: Tipo[] = [];
  subtipos: Subtipo[] = [];
  supertipo: Subtipo[] = [];
  costes: number[] = [];
  cantidadDeCartasMostrandose: number;
  cantidadDeCartasMostrandose2: number;

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

    this.conexion.getTodasLosSubTipos().pipe(
      map(subtipos => subtipos.sort((a, b) => a.nombreSubTipo.localeCompare(b.nombreSubTipo)))
    ).subscribe(subtipos => {
      this.supertipo = subtipos.filter(subtipo => subtipo.nombreSubTipo === 'REALEZA');
      this.subtipos = subtipos.filter(subtipo => subtipo.nombreSubTipo !== 'REALEZA');
    });
  }

  /**
   * Filtro de cartas según el nombre de la carta
   */
   searchByName() {
    this.filteredCartas = this.cartas.filter(carta =>
      carta.nombreCarta.includes(this.searchName)
    );

    this.cantidadDeCartasMostrandose = this.filteredCartas.length;
  }

  searchByText() {
    this.filteredCartas = this.cartas.filter(carta =>
      carta.textoCarta.toLowerCase().includes(this.searchText.toLowerCase())
    );

    this.cantidadDeCartasMostrandose = this.filteredCartas.length;
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

  onSubTipoChange(selectedSubTipo: number) {
    this.selectedSubTipo = selectedSubTipo;
    if(this.selectedSubTipo == 0) {
      this.selectedSubTipo = null;
    }
    this.filterCartas();
    this.cantidadDeCartasMostrandose = this.filteredCartas.length;
  }
  onSubTipo2Change(selectedSubTipo2: number) {
    this.selectedSubTipo2 = selectedSubTipo2;
    if(this.selectedSubTipo2 == 0) {
      this.selectedSubTipo2 = null;
    }
    this.filterCartas();
    this.cantidadDeCartasMostrandose = this.filteredCartas.length;
  }
  onSubTipo3Change(selectedSubTipo3: number) {
    this.selectedSubTipo3 = selectedSubTipo3;
    if(this.selectedSubTipo3 == 0) {
      this.selectedSubTipo3 = null;
    }
    this.filterCartas();
    this.cantidadDeCartasMostrandose = this.filteredCartas.length;
  }


  filterCartas() {
    this.filteredCartas = this.cartas.filter(carta => {
      // FILTRO DE 7
      if(this.selectedExpansion !== null && this.selectedRareza !== null && this.selectedTipo !== null && this.selectedCoste !== null
        && this.selectedSubTipo !== null && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null) {
        if(carta.rareza.idRareza == this.selectedRareza
          && carta.tipo.idTipo == this.selectedTipo
          && carta.expansion.idExpansion == this.selectedExpansion
          && carta.costeCarta == this.selectedCoste
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }

      // FILTRO DE 6
      if(this.selectedExpansion !== null && this.selectedRareza !== null && this.selectedTipo !== null
        && this.selectedSubTipo !== null && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null
        ) {
        if(carta.rareza.idRareza == this.selectedRareza
          && carta.tipo.idTipo == this.selectedTipo
          && carta.expansion.idExpansion == this.selectedExpansion
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }

      // FILTRO DE 6
      if(this.selectedRareza !== null && this.selectedTipo !== null && this.selectedCoste !== null
        && this.selectedSubTipo !== null && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null
        ) {
        if(carta.rareza.idRareza == this.selectedRareza
          && carta.tipo.idTipo == this.selectedTipo
          && carta.costeCarta == this.selectedCoste
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }

      // FILTRO DE 6
      if(this.selectedExpansion !== null && this.selectedTipo !== null && this.selectedCoste !== null
        && this.selectedSubTipo !== null && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null
        ) {
        if(carta.tipo.idTipo == this.selectedTipo
          && carta.expansion.idExpansion == this.selectedExpansion
          && carta.costeCarta == this.selectedCoste
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }

      // FILTRO DE 6
      if(this.selectedExpansion !== null && this.selectedRareza !== null && this.selectedCoste !== null
        && this.selectedSubTipo !== null && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null
        ) {
        if(carta.rareza.idRareza == this.selectedRareza
          && carta.expansion.idExpansion == this.selectedExpansion
          && carta.costeCarta == this.selectedCoste
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }

      // FILTRO DE 6
      if(this.selectedExpansion !== null && this.selectedRareza !== null && this.selectedCoste !== null && this.selectedTipo !== null
        && this.selectedSubTipo !== null && this.selectedSubTipo2 !== null
        ) {
        if(carta.rareza.idRareza == this.selectedRareza
          && carta.tipo.idTipo == this.selectedTipo
          && carta.expansion.idExpansion == this.selectedExpansion
          && carta.costeCarta == this.selectedCoste
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }

      // FILTRO DE 6
      if(this.selectedExpansion !== null && this.selectedRareza !== null && this.selectedCoste !== null && this.selectedTipo !== null
        && this.selectedSubTipo !== null && this.selectedSubTipo3 !== null
        ) {
        if(carta.rareza.idRareza == this.selectedRareza
          && carta.tipo.idTipo == this.selectedTipo
          && carta.expansion.idExpansion == this.selectedExpansion
          && carta.costeCarta == this.selectedCoste
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }

      // FILTRO DE 6
      if(this.selectedExpansion !== null && this.selectedRareza !== null && this.selectedCoste !== null && this.selectedTipo !== null
        && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null
        ) {
        if(carta.rareza.idRareza == this.selectedRareza
          && carta.tipo.idTipo == this.selectedTipo
          && carta.expansion.idExpansion == this.selectedExpansion
          && carta.costeCarta == this.selectedCoste
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }

      // FILTRO DE 5
      if(this.selectedExpansion !== null && this.selectedRareza !== null
        && this.selectedSubTipo !== null && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null
        ) {
        if(carta.rareza.idRareza == this.selectedRareza
          && carta.expansion.idExpansion == this.selectedExpansion
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }

      // FILTRO DE 5
      if(this.selectedExpansion !== null && this.selectedTipo !== null
        && this.selectedSubTipo !== null && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null
        ) {
        if(carta.tipo.idTipo == this.selectedTipo
          && carta.expansion.idExpansion == this.selectedExpansion
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }

      // FILTRO DE 5
      if(this.selectedTipo !== null && this.selectedCoste !== null
        && this.selectedSubTipo !== null && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null
        ) {
        if(carta.tipo.idTipo == this.selectedTipo
          && carta.costeCarta == this.selectedCoste
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }

      // FILTRO DE 5
      if(this.selectedExpansion !== null && this.selectedCoste !== null
        && this.selectedSubTipo !== null && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null
        ) {
        if(carta.expansion.idExpansion == this.selectedExpansion
          && carta.costeCarta == this.selectedCoste
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }

      // FILTRO DE 5
      if(this.selectedRareza !== null && this.selectedCoste !== null
        && this.selectedSubTipo !== null && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null
        ) {
        if(carta.rareza.idRareza == this.selectedRareza
          && carta.costeCarta == this.selectedCoste
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }

      // FILTRO DE 5
      if(this.selectedRareza !== null && this.selectedTipo !== null
        && this.selectedSubTipo !== null && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null
        ) {
        if(carta.tipo.idTipo == this.selectedTipo
          && carta.rareza.idRareza == this.selectedRareza
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }

      // FILTRO DE 5
      if(this.selectedRareza !== null && this.selectedTipo !== null
        && this.selectedSubTipo !== null && this.selectedSubTipo2 !== null && this.selectedCoste !== null
        ) {
        if(carta.tipo.idTipo == this.selectedTipo
          && carta.rareza.idRareza == this.selectedRareza
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          && carta.costeCarta == this.selectedCoste
          )
          {
            return true;
          } else {
            return false;
          }
      }

      // FILTRO DE 5
      if(this.selectedRareza !== null && this.selectedTipo !== null
        && this.selectedSubTipo !== null && this.selectedSubTipo3 !== null && this.selectedCoste !== null
        ) {
        if(carta.tipo.idTipo == this.selectedTipo
          && carta.rareza.idRareza == this.selectedRareza
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          && carta.costeCarta == this.selectedCoste
          )
          {
            return true;
          } else {
            return false;
          }
      }

      // FILTRO DE 5
      if(this.selectedRareza !== null && this.selectedTipo !== null
        && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null && this.selectedCoste !== null
        ) {
        if(carta.tipo.idTipo == this.selectedTipo
          && carta.rareza.idRareza == this.selectedRareza
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          && carta.costeCarta == this.selectedCoste
          )
          {
            return true;
          } else {
            return false;
          }
      }

      // FILTRO DE 5
      if(this.selectedRareza !== null && this.selectedTipo !== null
        && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null && this.selectedExpansion !== null
        ) {
        if(carta.tipo.idTipo == this.selectedTipo
          && carta.rareza.idRareza == this.selectedRareza
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          && carta.expansion.idExpansion == this.selectedExpansion
          )
          {
            return true;
          } else {
            return false;
          }
      }

      // FILTRO DE 5
      if(this.selectedRareza !== null && this.selectedTipo !== null
        && this.selectedSubTipo !== null && this.selectedSubTipo2 !== null && this.selectedExpansion !== null
        ) {
        if(carta.tipo.idTipo == this.selectedTipo
          && carta.rareza.idRareza == this.selectedRareza
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          && carta.expansion.idExpansion == this.selectedExpansion
          )
          {
            return true;
          } else {
            return false;
          }
      }

      // FILTRO DE 5
      if(this.selectedRareza !== null && this.selectedTipo !== null
        && this.selectedSubTipo !== null && this.selectedSubTipo3 !== null && this.selectedExpansion !== null
        ) {
        if(carta.tipo.idTipo == this.selectedTipo
          && carta.rareza.idRareza == this.selectedRareza
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          && carta.expansion.idExpansion == this.selectedExpansion
          )
          {
            return true;
          } else {
            return false;
          }
      }

      // FILTRO DE 5
      if(this.selectedRareza !== null && this.selectedTipo !== null
        && this.selectedSubTipo !== null && this.selectedCoste !== null && this.selectedExpansion !== null
        ) {
        if(carta.tipo.idTipo == this.selectedTipo
          && carta.rareza.idRareza == this.selectedRareza
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          && carta.costeCarta == this.selectedCoste
          && carta.expansion.idExpansion == this.selectedExpansion
          )
          {
            return true;
          } else {
            return false;
          }
      }
      // FILTRO DE 5
      if(this.selectedRareza !== null && this.selectedTipo !== null
        && this.selectedSubTipo2 !== null && this.selectedCoste !== null && this.selectedExpansion !== null
        ) {
        if(carta.tipo.idTipo == this.selectedTipo
          && carta.rareza.idRareza == this.selectedRareza
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          && carta.costeCarta == this.selectedCoste
          && carta.expansion.idExpansion == this.selectedExpansion
          )
          {
            return true;
          } else {
            return false;
          }
      }
      // FILTRO DE 5
      if(this.selectedRareza !== null && this.selectedTipo !== null
        && this.selectedSubTipo3 !== null && this.selectedCoste !== null && this.selectedExpansion !== null
        ) {
        if(carta.tipo.idTipo == this.selectedTipo
          && carta.rareza.idRareza == this.selectedRareza
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          && carta.costeCarta == this.selectedCoste
          && carta.expansion.idExpansion == this.selectedExpansion
          )
          {
            return true;
          } else {
            return false;
          }
      }

      // FILTRO DE 5
      if(this.selectedRareza !== null && this.selectedExpansion !== null
        && this.selectedSubTipo3 !== null && this.selectedCoste !== null && this.selectedSubTipo !== null
        ) {
        if((this.compararSubtipos(this.selectedSubTipo, carta))
          && carta.rareza.idRareza == this.selectedRareza
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          && carta.costeCarta == this.selectedCoste
          && carta.expansion.idExpansion == this.selectedExpansion
          )
          {
            return true;
          } else {
            return false;
          }
      }
      // FILTRO DE 5
      if(this.selectedRareza !== null && this.selectedExpansion !== null
        && this.selectedSubTipo2 !== null && this.selectedCoste !== null && this.selectedSubTipo !== null
        ) {
        if((this.compararSubtipos(this.selectedSubTipo, carta))
          && carta.rareza.idRareza == this.selectedRareza
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          && carta.costeCarta == this.selectedCoste
          && carta.expansion.idExpansion == this.selectedExpansion
          )
          {
            return true;
          } else {
            return false;
          }
      }
      // FILTRO DE 5
      if(this.selectedRareza !== null && this.selectedExpansion !== null
        && this.selectedSubTipo3 !== null && this.selectedCoste !== null && this.selectedSubTipo2 !== null
        ) {
        if((this.compararSubtipos(this.selectedSubTipo2, carta))
          && carta.rareza.idRareza == this.selectedRareza
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          && carta.costeCarta == this.selectedCoste
          && carta.expansion.idExpansion == this.selectedExpansion
          )
          {
            return true;
          } else {
            return false;
          }
      }

      // FILTRO DE 5
      if(this.selectedExpansion !== null && this.selectedTipo !== null
        && this.selectedSubTipo3 !== null && this.selectedCoste !== null && this.selectedSubTipo !== null
        ) {
        if(carta.tipo.idTipo == this.selectedTipo
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          && carta.costeCarta == this.selectedCoste
          && carta.expansion.idExpansion == this.selectedExpansion
          )
          {
            return true;
          } else {
            return false;
          }
      }
      // FILTRO DE 5
      if(this.selectedExpansion !== null && this.selectedTipo !== null
        && this.selectedSubTipo2 !== null && this.selectedCoste !== null && this.selectedSubTipo !== null
        ) {
        if(carta.tipo.idTipo == this.selectedTipo
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          && carta.costeCarta == this.selectedCoste
          && carta.expansion.idExpansion == this.selectedExpansion
          )
          {
            return true;
          } else {
            return false;
          }
      }
      // FILTRO DE 5
      if(this.selectedExpansion !== null && this.selectedTipo !== null
        && this.selectedSubTipo3 !== null && this.selectedCoste !== null && this.selectedSubTipo2 !== null
        ) {
        if(carta.tipo.idTipo == this.selectedTipo
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          && carta.costeCarta == this.selectedCoste
          && carta.expansion.idExpansion == this.selectedExpansion
          )
          {
            return true;
          } else {
            return false;
          }
      }


      // FILTRO DE 4
      if(this.selectedRareza !== null
        && this.selectedSubTipo !== null && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null
        ) {
        if(carta.rareza.idRareza == this.selectedRareza
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }

      // FILTRO DE 4
      if(this.selectedTipo !== null
        && this.selectedSubTipo !== null && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null
        ) {
        if(carta.tipo.idTipo == this.selectedTipo
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }

      // FILTRO DE 4
      if(this.selectedExpansion !== null
        && this.selectedSubTipo !== null && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null
        ) {
        if(carta.expansion.idExpansion == this.selectedExpansion
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }

      // FILTRO DE 4
      if(this.selectedCoste !== null
        && this.selectedSubTipo !== null && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null
        ) {
        if(carta.costeCarta == this.selectedCoste
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }
      // FILTRO DE 4
      if(this.selectedCoste !== null
        && this.selectedSubTipo !== null && this.selectedSubTipo2 !== null && this.selectedExpansion !== null
        ) {
        if(carta.costeCarta == this.selectedCoste
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          && carta.expansion.idExpansion == this.selectedExpansion
          )
          {
            return true;
          } else {
            return false;
          }
      }

      // FILTRO DE 4
      if(this.selectedCoste !== null
        && this.selectedSubTipo !== null && this.selectedSubTipo3 !== null && this.selectedExpansion !== null
        ) {
        if(carta.costeCarta == this.selectedCoste
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          && carta.expansion.idExpansion == this.selectedExpansion
          )
          {
            return true;
          } else {
            return false;
          }
      }
      // FILTRO DE 4
      if(this.selectedCoste !== null
        && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null && this.selectedExpansion !== null
        ) {
        if(carta.costeCarta == this.selectedCoste
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          && carta.expansion.idExpansion == this.selectedExpansion
          )
          {
            return true;
          } else {
            return false;
          }
      }
      // FILTRO DE 4
      if(this.selectedCoste !== null
        && this.selectedSubTipo !== null && this.selectedRareza !== null && this.selectedExpansion !== null
        ) {
        if(carta.costeCarta == this.selectedCoste
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          && carta.rareza.idRareza == this.selectedRareza
          && carta.expansion.idExpansion == this.selectedExpansion
          )
          {
            return true;
          } else {
            return false;
          }
      }
      // FILTRO DE 4
      if(this.selectedCoste !== null
        && this.selectedSubTipo2 !== null && this.selectedRareza !== null && this.selectedExpansion !== null
        ) {
        if(carta.costeCarta == this.selectedCoste
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          && carta.rareza.idRareza == this.selectedRareza
          && carta.expansion.idExpansion == this.selectedExpansion
          )
          {
            return true;
          } else {
            return false;
          }
      }
      // FILTRO DE 4
      if(this.selectedCoste !== null
        && this.selectedSubTipo3 !== null && this.selectedRareza !== null && this.selectedExpansion !== null
        ) {
        if(carta.costeCarta == this.selectedCoste
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          && carta.rareza.idRareza == this.selectedRareza
          && carta.expansion.idExpansion == this.selectedExpansion
          )
          {
            return true;
          } else {
            return false;
          }
      }
      // FILTRO DE 4
      if(this.selectedCoste !== null
        && this.selectedSubTipo !== null && this.selectedTipo !== null && this.selectedExpansion !== null
        ) {
        if(carta.costeCarta == this.selectedCoste
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          && carta.tipo.idTipo == this.selectedTipo
          && carta.expansion.idExpansion == this.selectedExpansion
          )
          {
            return true;
          } else {
            return false;
          }
      }
      // FILTRO DE 4
      if(this.selectedCoste !== null
        && this.selectedSubTipo2 !== null && this.selectedTipo !== null && this.selectedExpansion !== null
        ) {
        if(carta.costeCarta == this.selectedCoste
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          && carta.tipo.idTipo == this.selectedTipo
          && carta.expansion.idExpansion == this.selectedExpansion
          )
          {
            return true;
          } else {
            return false;
          }
      }
      // FILTRO DE 4
      if(this.selectedCoste !== null
        && this.selectedSubTipo3 !== null && this.selectedTipo !== null && this.selectedExpansion !== null
        ) {
        if(carta.costeCarta == this.selectedCoste
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          && carta.tipo.idTipo == this.selectedTipo
          && carta.expansion.idExpansion == this.selectedExpansion
          )
          {
            return true;
          } else {
            return false;
          }
      }

      // FILTRO DE 4
      if(this.selectedCoste !== null
        && this.selectedRareza !== null && this.selectedTipo !== null && this.selectedExpansion !== null
        ) {
        if(carta.costeCarta == this.selectedCoste
          && carta.rareza.idRareza == this.selectedRareza
          && carta.tipo.idTipo == this.selectedTipo
          && carta.expansion.idExpansion == this.selectedExpansion
          )
          {
            return true;
          } else {
            return false;
          }
      }

      // FILTRO DE 4 AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
      if(this.selectedCoste !== null
        && this.selectedSubTipo !== null && this.selectedSubTipo3 !== null && this.selectedRareza !== null
        ) {
        if(carta.costeCarta == this.selectedCoste
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          && carta.rareza.idRareza == this.selectedRareza
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }
      // FILTRO DE 4
      if(this.selectedCoste !== null
        && this.selectedSubTipo !== null && this.selectedSubTipo2 !== null && this.selectedRareza !== null
        ) {
        if(carta.costeCarta == this.selectedCoste
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          && carta.rareza.idRareza == this.selectedRareza
          )
          {
            return true;
          } else {
            return false;
          }
      }
      // FILTRO DE 4
      if(this.selectedCoste !== null
        && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null && this.selectedRareza !== null
        ) {
        if(carta.costeCarta == this.selectedCoste
          && carta.rareza.idRareza == this.selectedRareza
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }
      // FILTRO DE 4
      if(this.selectedTipo !== null
        && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null && this.selectedRareza !== null
        ) {
        if(carta.tipo.idTipo == this.selectedTipo
          && carta.rareza.idRareza == this.selectedRareza
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }
      // FILTRO DE 4
      if(this.selectedTipo !== null
        && this.selectedSubTipo !== null && this.selectedSubTipo3 !== null && this.selectedRareza !== null
        ) {
        if(carta.tipo.idTipo == this.selectedTipo
          && carta.rareza.idRareza == this.selectedRareza
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }
      // FILTRO DE 4
      if(this.selectedTipo !== null
        && this.selectedSubTipo !== null && this.selectedSubTipo2 !== null && this.selectedRareza !== null
        ) {
        if(carta.tipo.idTipo == this.selectedTipo
          && carta.rareza.idRareza == this.selectedRareza
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }

      // FILTRO DE 4
      if(this.selectedTipo !== null
        && this.selectedSubTipo !== null && this.selectedCoste !== null && this.selectedRareza !== null
        ) {
        if(carta.tipo.idTipo == this.selectedTipo
          && carta.rareza.idRareza == this.selectedRareza
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          && carta.costeCarta
          )
          {
            return true;
          } else {
            return false;
          }
      }
      // FILTRO DE 4
      if(this.selectedTipo !== null
        && this.selectedSubTipo2 !== null && this.selectedCoste !== null && this.selectedRareza !== null
        ) {
        if(carta.tipo.idTipo == this.selectedTipo
          && carta.rareza.idRareza == this.selectedRareza
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          && carta.costeCarta
          )
          {
            return true;
          } else {
            return false;
          }
      }
      // FILTRO DE 4
      if(this.selectedTipo !== null
        && this.selectedSubTipo3 !== null && this.selectedCoste !== null && this.selectedRareza !== null
        ) {
        if(carta.tipo.idTipo == this.selectedTipo
          && carta.rareza.idRareza == this.selectedRareza
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          && carta.costeCarta
          )
          {
            return true;
          } else {
            return false;
          }
      }

      // FILTRO DE 4
      if(this.selectedTipo !== null
        && this.selectedSubTipo !== null && this.selectedSubTipo3 !== null && this.selectedExpansion !== null
        ) {
        if(carta.tipo.idTipo == this.selectedTipo
          && carta.expansion.idExpansion == this.selectedExpansion
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }
      // FILTRO DE 4
      if(this.selectedTipo !== null
        && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null && this.selectedExpansion !== null
        ) {
        if(carta.tipo.idTipo == this.selectedTipo
          && carta.expansion.idExpansion == this.selectedExpansion
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }
      // FILTRO DE 4
      if(this.selectedTipo !== null
        && this.selectedSubTipo2 !== null && this.selectedSubTipo2 !== null && this.selectedExpansion !== null
        ) {
        if(carta.tipo.idTipo == this.selectedTipo
          && carta.expansion.idExpansion == this.selectedExpansion
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }

      // FILTRO DE 4
      if(this.selectedRareza !== null
        && this.selectedSubTipo !== null && this.selectedSubTipo3 !== null && this.selectedExpansion !== null
        ) {
        if(carta.rareza.idRareza == this.selectedRareza
          && carta.expansion.idExpansion == this.selectedExpansion
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }
      // FILTRO DE 4
      if(this.selectedRareza !== null
        && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null && this.selectedExpansion !== null
        ) {
        if(carta.rareza.idRareza == this.selectedRareza
          && carta.expansion.idExpansion == this.selectedExpansion
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }
      // FILTRO DE 4
      if(this.selectedRareza !== null
        && this.selectedSubTipo2 !== null && this.selectedSubTipo2 !== null && this.selectedExpansion !== null
        ) {
        if(carta.rareza.idRareza == this.selectedRareza
          && carta.expansion.idExpansion == this.selectedExpansion
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }

      // FILTRO DE 4
      if(this.selectedCoste !== null
        && this.selectedSubTipo2 !== null && this.selectedSubTipo2 !== null && this.selectedTipo !== null
        ) {
        if(carta.costeCarta == this.selectedCoste
          && carta.tipo.idTipo == this.selectedTipo
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }
      // FILTRO DE 4
      if(this.selectedCoste !== null
        && this.selectedSubTipo2 !== null && this.selectedSubTipo2 !== null && this.selectedTipo !== null
        ) {
        if(carta.costeCarta == this.selectedCoste
          && carta.tipo.idTipo == this.selectedTipo
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }
      // FILTRO DE 4
      if(this.selectedCoste !== null
        && this.selectedSubTipo2 !== null && this.selectedSubTipo2 !== null && this.selectedTipo !== null
        ) {
        if(carta.costeCarta == this.selectedCoste
          && carta.tipo.idTipo == this.selectedTipo
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }


      // FILTRO DE 4
      if(this.selectedExpansion !== null
        && this.selectedSubTipo !== null && this.selectedTipo !== null && this.selectedRareza !== null
        ) {
        if(carta.rareza.idRareza == this.selectedRareza
          && carta.tipo.idTipo == this.selectedTipo
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          && carta.expansion.idExpansion == this.selectedExpansion
          )
          {
            return true;
          } else {
            return false;
          }
      }
      // FILTRO DE 4
      if(this.selectedExpansion !== null
        && this.selectedSubTipo2 !== null && this.selectedTipo !== null && this.selectedRareza !== null
        ) {
        if(carta.rareza.idRareza == this.selectedRareza
          && carta.tipo.idTipo == this.selectedTipo
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          && carta.expansion.idExpansion == this.selectedExpansion
          )
          {
            return true;
          } else {
            return false;
          }
      }
      // FILTRO DE 4
      if(this.selectedExpansion !== null
        && this.selectedSubTipo3 !== null && this.selectedTipo !== null && this.selectedRareza !== null
        ) {
        if(carta.rareza.idRareza == this.selectedRareza
          && carta.tipo.idTipo == this.selectedTipo
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          && carta.expansion.idExpansion == this.selectedExpansion
          )
          {
            return true;
          } else {
            return false;
          }
      }






      // FILTROS DE A 3
      if(this.selectedRareza !== null && this.selectedTipo !== null && this.selectedExpansion !== null) {
        if(carta.rareza.idRareza == this.selectedRareza
          && carta.tipo.idTipo == this.selectedTipo
          && carta.expansion.idExpansion == this.selectedExpansion
          )
          {
            return true;
          } else {
            return false;
          }
      }
      if(this.selectedRareza !== null && this.selectedTipo !== null && this.selectedCoste !== null) {
        if(carta.rareza.idRareza == this.selectedRareza
          && carta.tipo.idTipo == this.selectedTipo
          && carta.costeCarta == this.selectedCoste
          )
          {
            return true;
          } else {
            return false;
          }
      }
      if(this.selectedCoste !== null && this.selectedExpansion !== null && this.selectedRareza !== null) {
        if(carta.rareza.idRareza == this.selectedRareza
          && carta.expansion.idExpansion == this.selectedExpansion
          && carta.costeCarta == this.selectedCoste
          )
          {
            return true;
          } else {
            return false;
          }
      }
      //



      // FILTROS DE A 3
      if(this.selectedRareza !== null && this.selectedSubTipo !== null && this.selectedSubTipo2 !== null) {
        if(carta.rareza.idRareza == this.selectedRareza
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }
      if(this.selectedRareza !== null && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null) {
        if(carta.rareza.idRareza == this.selectedRareza
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }
      if(this.selectedRareza !== null && this.selectedSubTipo3 !== null && this.selectedSubTipo !== null) {
        if(carta.rareza.idRareza == this.selectedRareza
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }
      //

      // FILTROS DE A 3
      if(this.selectedExpansion !== null && this.selectedSubTipo !== null && this.selectedSubTipo2 !== null) {
        if(carta.expansion.idExpansion == this.selectedExpansion
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }
      if(this.selectedExpansion !== null && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null) {
        if(carta.expansion.idExpansion == this.selectedExpansion
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }
      if(this.selectedExpansion !== null && this.selectedSubTipo3 !== null && this.selectedSubTipo !== null) {
        if(carta.expansion.idExpansion == this.selectedExpansion
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }
      //

      // FILTROS DE A 3
      if(this.selectedTipo !== null && this.selectedSubTipo !== null && this.selectedSubTipo2 !== null) {
        if(carta.tipo.idTipo == this.selectedTipo
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }
      if(this.selectedTipo !== null && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null) {
        if(carta.tipo.idTipo == this.selectedTipo
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }
      if(this.selectedTipo !== null && this.selectedSubTipo3 !== null && this.selectedSubTipo !== null) {
        if(carta.tipo.idTipo == this.selectedTipo
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }
      //

      // FILTROS DE A 3
      if(this.selectedCoste !== null && this.selectedSubTipo !== null && this.selectedSubTipo2 !== null) {
        if(carta.costeCarta == this.selectedCoste
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }
      if(this.selectedCoste !== null && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null) {
        if(carta.costeCarta == this.selectedCoste
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }
      if(this.selectedCoste !== null && this.selectedSubTipo3 !== null && this.selectedSubTipo !== null) {
        if(carta.costeCarta == this.selectedCoste
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }
      //

      // FILTRO DE 3
      if(this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null && this.selectedSubTipo !== null) {
        if((this.compararSubtipos(this.selectedSubTipo2, carta))
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }


      // FILTRO DE 3
      if(this.selectedExpansion !== null && this.selectedTipo !== null && this.selectedCoste !== null) {
        if(carta.costeCarta == this.selectedCoste
          && carta.expansion.idExpansion == this.selectedExpansion
          && carta.tipo.idTipo == this.selectedTipo
          )
          {
            return true;
          } else {
            return false;
          }
      }
      // FILTRO DE 3
      if(this.selectedExpansion !== null && this.selectedTipo !== null && this.selectedSubTipo !== null) {
        if((this.compararSubtipos(this.selectedSubTipo, carta))
          && carta.expansion.idExpansion == this.selectedExpansion
          && carta.tipo.idTipo == this.selectedTipo
          )
          {
            return true;
          } else {
            return false;
          }
      }
      // FILTRO DE 3
      if(this.selectedExpansion !== null && this.selectedTipo !== null && this.selectedSubTipo2 !== null) {
        if((this.compararSubtipos(this.selectedSubTipo2, carta))
          && carta.expansion.idExpansion == this.selectedExpansion
          && carta.tipo.idTipo == this.selectedTipo
          )
          {
            return true;
          } else {
            return false;
          }
      }
      // FILTRO DE 3
      if(this.selectedExpansion !== null && this.selectedTipo !== null && this.selectedSubTipo3 !== null) {
        if((this.compararSubtipos(this.selectedSubTipo3, carta))
          && carta.expansion.idExpansion == this.selectedExpansion
          && carta.tipo.idTipo == this.selectedTipo
          )
          {
            return true;
          } else {
            return false;
          }
      }
      // FILTRO DE 3
      if(this.selectedExpansion !== null && this.selectedRareza !== null && this.selectedSubTipo !== null) {
        if((this.compararSubtipos(this.selectedSubTipo, carta))
          && carta.expansion.idExpansion == this.selectedExpansion
          && carta.rareza.idRareza == this.selectedRareza
          )
          {
            return true;
          } else {
            return false;
          }
      }
      // FILTRO DE 3
      if(this.selectedExpansion !== null && this.selectedRareza !== null && this.selectedSubTipo2 !== null) {
        if((this.compararSubtipos(this.selectedSubTipo2, carta))
          && carta.expansion.idExpansion == this.selectedExpansion
          && carta.rareza.idRareza == this.selectedRareza
          )
          {
            return true;
          } else {
            return false;
          }
      }
      // FILTRO DE 3
      if(this.selectedExpansion !== null && this.selectedRareza !== null && this.selectedSubTipo3 !== null) {
        if((this.compararSubtipos(this.selectedSubTipo3, carta))
          && carta.expansion.idExpansion == this.selectedExpansion
          && carta.rareza.idRareza == this.selectedRareza
          )
          {
            return true;
          } else {
            return false;
          }
      }

      // FILTRO DE 3
      if(this.selectedExpansion !== null && this.selectedCoste !== null && this.selectedSubTipo !== null) {
        if((this.compararSubtipos(this.selectedSubTipo, carta))
          && carta.expansion.idExpansion == this.selectedExpansion
          && carta.costeCarta == this.selectedCoste
          )
          {
            return true;
          } else {
            return false;
          }
      }
      // FILTRO DE 3
      if(this.selectedExpansion !== null && this.selectedCoste !== null && this.selectedSubTipo2 !== null) {
        if((this.compararSubtipos(this.selectedSubTipo2, carta))
          && carta.expansion.idExpansion == this.selectedExpansion
          && carta.costeCarta == this.selectedCoste
          )
          {
            return true;
          } else {
            return false;
          }
      }
      // FILTRO DE 3
      if(this.selectedExpansion !== null && this.selectedCoste !== null && this.selectedSubTipo3 !== null) {
        if((this.compararSubtipos(this.selectedSubTipo3, carta))
          && carta.expansion.idExpansion == this.selectedExpansion
          && carta.costeCarta == this.selectedCoste
          )
          {
            return true;
          } else {
            return false;
          }
      }

      // FILTRO DE 3
      if(this.selectedRareza !== null && this.selectedCoste !== null && this.selectedSubTipo !== null) {
        if((this.compararSubtipos(this.selectedSubTipo, carta))
          && carta.rareza.idRareza == this.selectedRareza
          && carta.costeCarta == this.selectedCoste
          )
          {
            return true;
          } else {
            return false;
          }
      }
      // FILTRO DE 3
      if(this.selectedRareza !== null && this.selectedCoste !== null && this.selectedSubTipo2 !== null) {
        if((this.compararSubtipos(this.selectedSubTipo2, carta))
          && carta.rareza.idRareza == this.selectedRareza
          && carta.costeCarta == this.selectedCoste
          )
          {
            return true;
          } else {
            return false;
          }
      }
      // FILTRO DE 3
      if(this.selectedRareza !== null && this.selectedCoste !== null && this.selectedSubTipo3 !== null) {
        if((this.compararSubtipos(this.selectedSubTipo3, carta))
          && carta.rareza.idRareza == this.selectedRareza
          && carta.costeCarta == this.selectedCoste
          )
          {
            return true;
          } else {
            return false;
          }
      }

      // FILTRO DE 3
      if(this.selectedTipo !== null && this.selectedCoste !== null && this.selectedSubTipo !== null) {
        if((this.compararSubtipos(this.selectedSubTipo, carta))
          && carta.tipo.idTipo == this.selectedTipo
          && carta.costeCarta == this.selectedCoste
          )
          {
            return true;
          } else {
            return false;
          }
      }
      // FILTRO DE 3
      if(this.selectedTipo !== null && this.selectedCoste !== null && this.selectedSubTipo2 !== null) {
        if((this.compararSubtipos(this.selectedSubTipo2, carta))
          && carta.tipo.idTipo == this.selectedTipo
          && carta.costeCarta == this.selectedCoste
          )
          {
            return true;
          } else {
            return false;
          }
      }
      // FILTRO DE 3
      if(this.selectedTipo !== null && this.selectedCoste !== null && this.selectedSubTipo3 !== null) {
        if((this.compararSubtipos(this.selectedSubTipo3, carta))
          && carta.tipo.idTipo == this.selectedTipo
          && carta.costeCarta == this.selectedCoste
          )
          {
            return true;
          } else {
            return false;
          }
      }

      // FILTRO DE 3
      if(this.selectedTipo !== null && this.selectedRareza !== null && this.selectedSubTipo !== null) {
        if((this.compararSubtipos(this.selectedSubTipo, carta))
          && carta.tipo.idTipo == this.selectedTipo
          && carta.rareza.idRareza == this.selectedRareza
          )
          {
            return true;
          } else {
            return false;
          }
      }
      // FILTRO DE 3
      if(this.selectedTipo !== null && this.selectedRareza !== null && this.selectedSubTipo2 !== null) {
        if((this.compararSubtipos(this.selectedSubTipo2, carta))
          && carta.tipo.idTipo == this.selectedTipo
          && carta.rareza.idRareza == this.selectedRareza
          )
          {
            return true;
          } else {
            return false;
          }
      }
      // FILTRO DE 3
      if(this.selectedTipo !== null && this.selectedRareza !== null && this.selectedSubTipo3 !== null) {
        if((this.compararSubtipos(this.selectedSubTipo3, carta))
          && carta.tipo.idTipo == this.selectedTipo
          && carta.rareza.idRareza == this.selectedRareza
          )
          {
            return true;
          } else {
            return false;
          }
      }


      // FILTROS DE A 2
      if(this.selectedTipo !== null && this.selectedRareza !== null) {
        if(carta.tipo.idTipo == this.selectedTipo
          && carta.rareza.idRareza == this.selectedRareza
          )
          {
            return true;
          } else {
            return false;
          }
      }

      // FILTROS DE A 2
      if(this.selectedTipo !== null && this.selectedExpansion !== null) {
        if(carta.tipo.idTipo == this.selectedTipo
          && carta.expansion.idExpansion == this.selectedExpansion
          )
          {
            return true;
          } else {
            return false;
          }
      }

      // FILTROS DE A 2
      if(this.selectedTipo !== null && this.selectedCoste !== null) {
        if(carta.tipo.idTipo == this.selectedTipo
          && carta.costeCarta == this.selectedCoste
          )
          {
            return true;
          } else {
            return false;
          }
      }

      // FILTROS DE A 2
      if(this.selectedRareza !== null && this.selectedCoste !== null) {
        if(carta.rareza.idRareza == this.selectedRareza
          && carta.costeCarta == this.selectedCoste
          )
          {
            return true;
          } else {
            return false;
          }
      }

      // FILTROS DE A 2
      if(this.selectedExpansion !== null && this.selectedCoste !== null) {
        if(carta.expansion.idExpansion == this.selectedExpansion
          && carta.costeCarta == this.selectedCoste
          )
          {
            return true;
          } else {
            return false;
          }
      }

      // FILTROS DE A 2
      if(this.selectedRareza !== null && this.selectedExpansion !== null) {
        if(carta.rareza.idRareza == this.selectedRareza
          && carta.expansion.idExpansion == this.selectedExpansion
          )
          {
            return true;
          } else {
            return false;
          }
      }

      // FILTROS DE A 2
      if(this.selectedTipo !== null && this.selectedSubTipo !== null) {
        if(carta.tipo.idTipo == this.selectedTipo
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }
      if(this.selectedTipo !== null && this.selectedSubTipo2 !== null) {
        if(carta.tipo.idTipo == this.selectedTipo
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }
      if(this.selectedTipo !== null && this.selectedSubTipo3 !== null) {
        if(carta.tipo.idTipo == this.selectedTipo
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }

      // FILTROS DE A 2
      if(this.selectedRareza !== null && this.selectedSubTipo !== null) {
        if(carta.rareza.idRareza == this.selectedRareza
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }
      if(this.selectedRareza !== null && this.selectedSubTipo2 !== null) {
        if(carta.rareza.idRareza == this.selectedRareza
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }
      if(this.selectedRareza !== null && this.selectedSubTipo3 !== null) {
        if(carta.rareza.idRareza == this.selectedRareza
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }
      //

      // FILTROS DE A 2
      if(this.selectedExpansion !== null && this.selectedSubTipo !== null) {
        if(carta.expansion.idExpansion == this.selectedExpansion
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }
      if(this.selectedExpansion !== null && this.selectedSubTipo2 !== null) {
        if(carta.expansion.idExpansion == this.selectedExpansion
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }
      if(this.selectedExpansion !== null && this.selectedSubTipo3 !== null) {
        if(carta.expansion.idExpansion == this.selectedExpansion
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }
      //

      // FILTROS DE A 2
      if(this.selectedCoste !== null && this.selectedSubTipo !== null) {
        if(carta.costeCarta == this.selectedCoste
          && (this.compararSubtipos(this.selectedSubTipo, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }
      if(this.selectedCoste !== null && this.selectedSubTipo2 !== null) {
        if(carta.costeCarta == this.selectedCoste
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }
      if(this.selectedCoste !== null && this.selectedSubTipo3 !== null) {
        if(carta.costeCarta == this.selectedCoste
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }

      // FILTROS DE A 2
      if(this.selectedSubTipo !== null && this.selectedSubTipo2 !== null) {
        if((this.compararSubtipos(this.selectedSubTipo, carta))
          && (this.compararSubtipos(this.selectedSubTipo2, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }
      if(this.selectedSubTipo !== null && this.selectedSubTipo3 !== null) {
        if((this.compararSubtipos(this.selectedSubTipo, carta))
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }
      if(this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null) {
        if((this.compararSubtipos(this.selectedSubTipo2, carta))
          && (this.compararSubtipos(this.selectedSubTipo3, carta))
          )
          {
            return true;
          } else {
            return false;
          }
      }
      //

      // FILTROS DE 1
      if(this.selectedRareza !== null) {
        if(carta.rareza.idRareza == this.selectedRareza)
          {
            return true;
          } else {
            return false;
          }
      }
      if(this.selectedExpansion !== null) {
        if(carta.expansion.idExpansion == this.selectedExpansion)
          {
            return true;
          } else {
            return false;
          }
      }
      if(this.selectedTipo !== null) {
        if(carta.tipo.idTipo == this.selectedTipo)
          {
            return true;
          } else {
            return false;
          }
      }

      if(this.selectedCoste !== null) {
        if(carta.costeCarta == this.selectedCoste)
          {
            return true;
          } else {
            return false;
          }
      }

      if(this.selectedSubTipo !== null) {
        return this.compararSubtipos(this.selectedSubTipo, carta);
      }
      if(this.selectedSubTipo2 !== null) {
        return this.compararSubtipos(this.selectedSubTipo2, carta);
      }
      if(this.selectedSubTipo3 !== null) {
        return this.compararSubtipos(this.selectedSubTipo3, carta);
      }

      return false;
    });
  }

  /**
   * Chequea cuántos filtros han sido seleccionados en simúltaneo, y va filtrando cartas acorde a ello
   */
  // filterCartas() {
  //   this.filteredCartas = this.cartas.filter(carta => {
  //     // Comprobación de si cada filtro está establecido (no '0' que es nuestro valor para 'Deseleccionar').
  //     let matchesExpansion = this.selectedExpansion === null || carta.expansion.idExpansion === this.selectedExpansion;
  //     let matchesRareza = this.selectedRareza === null || carta.rareza.idRareza === this.selectedRareza;
  //     let matchesTipo = this.selectedTipo === null || carta.tipo.idTipo === this.selectedTipo;
  //     let matchesSubTipo = this.selectedSubTipo === null || carta.subtipo.idSubTipo === this.selectedSubTipo;
  //     let matchesSubTipo2 = this.selectedSubTipo2 === null || carta.subtipo2.idSubTipo === this.selectedSubTipo2;
  //     let matchesSubTipo3 = this.selectedSubTipo3 === null || carta.subtipo3.idSubTipo === this.selectedSubTipo3;
  //     let matchesCoste = this.selectedCoste === null || carta.costeCarta === this.selectedCoste;

  //     // Solo aplica los filtros que están activamente seleccionados.
  //     return (!this.selectedExpansion || matchesExpansion) &&
  //           (!this.selectedRareza || matchesRareza) &&
  //           (!this.selectedTipo || matchesTipo) &&
  //           (!this.selectedSubTipo || matchesSubTipo) &&
  //           (!this.selectedSubTipo2 || matchesSubTipo2) &&
  //           (!this.selectedSubTipo3 || matchesSubTipo3) &&
  //           (!this.selectedCoste || matchesCoste);
  //   });
  // }

  subtipoSeleccionado(id1, id2, id3, carta) {
    if(id1 !== null) {
      return this.compararSubtipos(id1, carta);
    }
    if(id2 !== null) {
      return this.compararSubtipos(id2, carta);
    }
    if(id3 !== null) {
      return this.compararSubtipos(id3, carta);
    }

    return false;
  }

  compararSubtipos(idSubtipo: number, carta: Carta) {
    if(carta.subtipo && carta.subtipo2 && carta.subtipo3) {
      if(carta.subtipo.idSubTipo == idSubtipo || carta.subtipo2.idSubTipo == idSubtipo || carta.subtipo3.idSubTipo == idSubtipo) {
        return true
      } else {
        return false;
      }
    } else {
      if(carta.subtipo2 && carta.subtipo3) {
        if(carta.subtipo2.idSubTipo == idSubtipo || carta.subtipo3.idSubTipo == idSubtipo) {
          return true
        } else {
          return false;
        }
      } else {
        if(carta.subtipo && carta.subtipo3) {
          if(carta.subtipo.idSubTipo == idSubtipo || carta.subtipo3.idSubTipo == idSubtipo) {
            return true
          } else {
            return false;
          }
        } else {
          if(carta.subtipo && carta.subtipo2) {
            if(carta.subtipo.idSubTipo == idSubtipo || carta.subtipo2.idSubTipo == idSubtipo) {
              return true
            } else {
              return false;
            }
          } else {
            if(carta.subtipo) {
              if(carta.subtipo.idSubTipo == idSubtipo) {
                return true
              } else {
                return false;
              }
            }
            if(carta.subtipo2) {
              if(carta.subtipo2.idSubTipo == idSubtipo) {
                return true
              } else {
                return false;
              }
            }
            if(carta.subtipo3) {
              if(carta.subtipo3.idSubTipo == idSubtipo) {
                return true
              } else {
                return false;
              }
            } else {
              return false;
            }
          }
        }
      }
    }

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

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
  filteredCartasNuevo: Carta[] = [];
  banderaFiltroExcluyente: boolean = false;
  banderaFiltroIncluyente: boolean = false;
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

  soloDominacion() {
    this.expansiones = this.conexion.getTodasLasExpasDominacion();

    this.conexion.getTodasLasCartasOrdenadas().subscribe((dato) => {
      // Filtra las cartas por visibilidad y expansión
      this.cartas = dato.filter(carta => carta.expansion.visibilidad && carta.expansion.idExpansion !== 2);


    // Excluye baneadas
    this.cartas = this.cartas.filter(carta => carta.baneada == false);

    this.cartas = this.cartas.filter(carta => carta.tipo.idTipo !== 30);

      // Obtiene y ordena los costes únicos de las cartas
      this.costes = this.getUniqueCostesCartas(this.cartas);
      this.costes = this.costes.sort((a, b) => b - a);
      // Establece las cartas filtradas
      this.filteredCartasNuevo = this.cartas;
    });
  }

  getCardImage(card: Carta): string {
    // Retorna la ruta local de la carta
    return `../../../../assets/decklists/${card.nombreCarta}.webp`;
  }

  onImageError(event: Event, card: Carta): void {
    // Cambia la imagen rota a la URL remota o una imagen predeterminada
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = card.urlImagen;
  }

  filters = {
    rareza: [] as string[],
    tipo: [] as string[],
    expansion: [] as string[],
    subtipo: [] as string[],
    subtipo2: [] as string[],
    subtipo3: [] as string[],
    costeCarta: [] as number[]
  };


  updateFilters(category: string, value: string | number, event: any): void {
    if (event.target.checked) {
      this.filters[category].push(value);
    } else {
      const index = this.filters[category].indexOf(value);
      if (index > -1) {
        this.filters[category].splice(index, 1);
      }
    }
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredCartasNuevo = this.cartas.filter(carta => {
      return (this.filters.rareza.length ? this.filters.rareza.includes(carta.rareza.nombreRareza) : true) &&
             (this.filters.tipo.length ?
                this.filters.tipo.includes(carta.tipo?.nombreTipo) ||
                this.filters.tipo.includes(carta.tipo2?.nombreTipo)
                : true) &&
             (this.filters.expansion.length ? this.filters.expansion.includes(carta.expansion.nombreExpansion) : true) &&
             (this.filters.subtipo.length ?
               this.filters.subtipo.includes(carta.subtipo?.nombreSubTipo) ||
               this.filters.subtipo.includes(carta.subtipo2?.nombreSubTipo) ||
               this.filters.subtipo.includes(carta.subtipo3?.nombreSubTipo)
               : true) &&
             (this.filters.costeCarta.length ? this.filters.costeCarta.includes(carta.costeCarta) : true);
    });
  }

  updateStrictFilters(category: string, value: string | number, event: any): void {
    if (event.target.checked) {
      this.filters[category].push(value);
    } else {
      const index = this.filters[category].indexOf(value);
      if (index > -1) {
        this.filters[category].splice(index, 1);
      }
    }
    this.applyStrictFilters();
  }

  applyStrictFilters(): void {
    this.filteredCartasNuevo = this.cartas.filter(carta => {
      // Verificar rareza: debe cumplir con TODAS las rarezas seleccionadas.
      const rarezaCumple =
        this.filters.rareza.length === 0 || this.filters.rareza.includes(carta.rareza.nombreRareza);

      // Verificar tipo: debe cumplir con TODOS los tipos seleccionados.
      const tipoCumple =
        this.filters.tipo.length === 0 ||
        this.filters.tipo.every(tipo =>
          (carta.tipo && carta.tipo.nombreTipo === tipo) ||
          (carta.tipo2 && carta.tipo2.nombreTipo === tipo)
        );

      // Verificar expansión: debe cumplir con TODAS las expansiones seleccionadas.
      const expansionCumple =
        this.filters.expansion.length === 0 || this.filters.expansion.includes(carta.expansion.nombreExpansion);

      // Verificar subtipo: debe cumplir con TODOS los subtipos seleccionados.
      const subtipoCumple =
        this.filters.subtipo.length === 0 ||
        this.filters.subtipo.every(subtipo =>
          (carta.subtipo && carta.subtipo.nombreSubTipo === subtipo) ||
          (carta.subtipo2 && carta.subtipo2.nombreSubTipo === subtipo) ||
          (carta.subtipo3 && carta.subtipo3.nombreSubTipo === subtipo)
        );

      // Verificar costeCarta: debe cumplir con TODOS los costes seleccionados.
      const costeCartaCumple =
        this.filters.costeCarta.length === 0 || this.filters.costeCarta.includes(carta.costeCarta);

      // Devuelve true solo si TODAS las condiciones son verdaderas.
      return rarezaCumple && tipoCumple && expansionCumple && subtipoCumple && costeCartaCumple;
    });
  }


  cambiarBanderaFiltro(sentido: boolean): void {
    this.searchName = null;
    this.searchText = null;

    // Reiniciar filtros, asegurando que todos los campos requeridos estén presentes
    this.filters = {
      rareza: [],
      tipo: [],
      expansion: [],
      subtipo: [],
      subtipo2: [],
      subtipo3: [],
      costeCarta: []
    };

    // Actualizar banderas
    if (sentido) {
      this.banderaFiltroIncluyente = true;
      this.banderaFiltroExcluyente = false;
      this.filteredCartasNuevo = this.cartas;
    } else {
      this.banderaFiltroIncluyente = false;
      this.banderaFiltroExcluyente = true;
      this.filteredCartasNuevo = this.cartas;
    }
  }

  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.accordion')) {
      this.closeAllAccordions();
    }
  }

  closeAllAccordions(): void {
    const accordions = document.querySelectorAll('.accordion-collapse');
    accordions.forEach(accordion => {
      (accordion as HTMLElement).classList.remove('show');
    });
  }

  isExpansionSelected(nombreExpansion: string): boolean {
    return this.filters.expansion.includes(nombreExpansion);
  }
  isRarezaSelected(nombreRareza: string): boolean {
    return this.filters.rareza.includes(nombreRareza);
  }
  isCosteSelected(costeCarta: number): boolean {
    return this.filters.costeCarta.includes(costeCarta);
  }
  isTipoSelected(nombreTipo: string): boolean {
    return this.filters.tipo.includes(nombreTipo);
  }
  isSubtipoSelected(nombreSubTipo: string): boolean {
    return this.filters.subtipo.includes(nombreSubTipo);
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

  irAlGlosario() {
    this.route.navigate(['/tabs/tab2/glosario']);
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




  // filterCartas() {
  //   this.filteredCartas = this.cartas.filter(carta => {
  //     // FILTRO DE 7
  //     if(this.selectedExpansion !== null && this.selectedRareza !== null && this.selectedTipo !== null && this.selectedCoste !== null
  //       && this.selectedSubTipo !== null && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null) {
  //       if(carta.rareza.idRareza == this.selectedRareza
  //         && carta.tipo.idTipo == this.selectedTipo
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         && carta.costeCarta == this.selectedCoste
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }

  //     // FILTRO DE 6
  //     if(this.selectedExpansion !== null && this.selectedRareza !== null && this.selectedTipo !== null
  //       && this.selectedSubTipo !== null && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null
  //       ) {
  //       if(carta.rareza.idRareza == this.selectedRareza
  //         && carta.tipo.idTipo == this.selectedTipo
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }

  //     // FILTRO DE 6
  //     if(this.selectedRareza !== null && this.selectedTipo !== null && this.selectedCoste !== null
  //       && this.selectedSubTipo !== null && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null
  //       ) {
  //       if(carta.rareza.idRareza == this.selectedRareza
  //         && carta.tipo.idTipo == this.selectedTipo
  //         && carta.costeCarta == this.selectedCoste
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }

  //     // FILTRO DE 6
  //     if(this.selectedExpansion !== null && this.selectedTipo !== null && this.selectedCoste !== null
  //       && this.selectedSubTipo !== null && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null
  //       ) {
  //       if(carta.tipo.idTipo == this.selectedTipo
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         && carta.costeCarta == this.selectedCoste
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }

  //     // FILTRO DE 6
  //     if(this.selectedExpansion !== null && this.selectedRareza !== null && this.selectedCoste !== null
  //       && this.selectedSubTipo !== null && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null
  //       ) {
  //       if(carta.rareza.idRareza == this.selectedRareza
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         && carta.costeCarta == this.selectedCoste
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }

  //     // FILTRO DE 6
  //     if(this.selectedExpansion !== null && this.selectedRareza !== null && this.selectedCoste !== null && this.selectedTipo !== null
  //       && this.selectedSubTipo !== null && this.selectedSubTipo2 !== null
  //       ) {
  //       if(carta.rareza.idRareza == this.selectedRareza
  //         && carta.tipo.idTipo == this.selectedTipo
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         && carta.costeCarta == this.selectedCoste
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }

  //     // FILTRO DE 6
  //     if(this.selectedExpansion !== null && this.selectedRareza !== null && this.selectedCoste !== null && this.selectedTipo !== null
  //       && this.selectedSubTipo !== null && this.selectedSubTipo3 !== null
  //       ) {
  //       if(carta.rareza.idRareza == this.selectedRareza
  //         && carta.tipo.idTipo == this.selectedTipo
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         && carta.costeCarta == this.selectedCoste
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }

  //     // FILTRO DE 6
  //     if(this.selectedExpansion !== null && this.selectedRareza !== null && this.selectedCoste !== null && this.selectedTipo !== null
  //       && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null
  //       ) {
  //       if(carta.rareza.idRareza == this.selectedRareza
  //         && carta.tipo.idTipo == this.selectedTipo
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         && carta.costeCarta == this.selectedCoste
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }

  //     // FILTRO DE 5
  //     if(this.selectedExpansion !== null && this.selectedRareza !== null
  //       && this.selectedSubTipo !== null && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null
  //       ) {
  //       if(carta.rareza.idRareza == this.selectedRareza
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }

  //     // FILTRO DE 5
  //     if(this.selectedExpansion !== null && this.selectedTipo !== null
  //       && this.selectedSubTipo !== null && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null
  //       ) {
  //       if(carta.tipo.idTipo == this.selectedTipo
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }

  //     // FILTRO DE 5
  //     if(this.selectedTipo !== null && this.selectedCoste !== null
  //       && this.selectedSubTipo !== null && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null
  //       ) {
  //       if(carta.tipo.idTipo == this.selectedTipo
  //         && carta.costeCarta == this.selectedCoste
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }

  //     // FILTRO DE 5
  //     if(this.selectedExpansion !== null && this.selectedCoste !== null
  //       && this.selectedSubTipo !== null && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null
  //       ) {
  //       if(carta.expansion.idExpansion == this.selectedExpansion
  //         && carta.costeCarta == this.selectedCoste
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }

  //     // FILTRO DE 5
  //     if(this.selectedRareza !== null && this.selectedCoste !== null
  //       && this.selectedSubTipo !== null && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null
  //       ) {
  //       if(carta.rareza.idRareza == this.selectedRareza
  //         && carta.costeCarta == this.selectedCoste
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }

  //     // FILTRO DE 5
  //     if(this.selectedRareza !== null && this.selectedTipo !== null
  //       && this.selectedSubTipo !== null && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null
  //       ) {
  //       if(carta.tipo.idTipo == this.selectedTipo
  //         && carta.rareza.idRareza == this.selectedRareza
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }

  //     // FILTRO DE 5
  //     if(this.selectedRareza !== null && this.selectedTipo !== null
  //       && this.selectedSubTipo !== null && this.selectedSubTipo2 !== null && this.selectedCoste !== null
  //       ) {
  //       if(carta.tipo.idTipo == this.selectedTipo
  //         && carta.rareza.idRareza == this.selectedRareza
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && carta.costeCarta == this.selectedCoste
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }

  //     // FILTRO DE 5
  //     if(this.selectedRareza !== null && this.selectedTipo !== null
  //       && this.selectedSubTipo !== null && this.selectedSubTipo3 !== null && this.selectedCoste !== null
  //       ) {
  //       if(carta.tipo.idTipo == this.selectedTipo
  //         && carta.rareza.idRareza == this.selectedRareza
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         && carta.costeCarta == this.selectedCoste
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }

  //     // FILTRO DE 5
  //     if(this.selectedRareza !== null && this.selectedTipo !== null
  //       && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null && this.selectedCoste !== null
  //       ) {
  //       if(carta.tipo.idTipo == this.selectedTipo
  //         && carta.rareza.idRareza == this.selectedRareza
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         && carta.costeCarta == this.selectedCoste
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }

  //     // FILTRO DE 5
  //     if(this.selectedRareza !== null && this.selectedTipo !== null
  //       && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null && this.selectedExpansion !== null
  //       ) {
  //       if(carta.tipo.idTipo == this.selectedTipo
  //         && carta.rareza.idRareza == this.selectedRareza
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }

  //     // FILTRO DE 5
  //     if(this.selectedRareza !== null && this.selectedTipo !== null
  //       && this.selectedSubTipo !== null && this.selectedSubTipo2 !== null && this.selectedExpansion !== null
  //       ) {
  //       if(carta.tipo.idTipo == this.selectedTipo
  //         && carta.rareza.idRareza == this.selectedRareza
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }

  //     // FILTRO DE 5
  //     if(this.selectedRareza !== null && this.selectedTipo !== null
  //       && this.selectedSubTipo !== null && this.selectedSubTipo3 !== null && this.selectedExpansion !== null
  //       ) {
  //       if(carta.tipo.idTipo == this.selectedTipo
  //         && carta.rareza.idRareza == this.selectedRareza
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }

  //     // FILTRO DE 5
  //     if(this.selectedRareza !== null && this.selectedTipo !== null
  //       && this.selectedSubTipo !== null && this.selectedCoste !== null && this.selectedExpansion !== null
  //       ) {
  //       if(carta.tipo.idTipo == this.selectedTipo
  //         && carta.rareza.idRareza == this.selectedRareza
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         && carta.costeCarta == this.selectedCoste
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     // FILTRO DE 5
  //     if(this.selectedRareza !== null && this.selectedTipo !== null
  //       && this.selectedSubTipo2 !== null && this.selectedCoste !== null && this.selectedExpansion !== null
  //       ) {
  //       if(carta.tipo.idTipo == this.selectedTipo
  //         && carta.rareza.idRareza == this.selectedRareza
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && carta.costeCarta == this.selectedCoste
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     // FILTRO DE 5
  //     if(this.selectedRareza !== null && this.selectedTipo !== null
  //       && this.selectedSubTipo3 !== null && this.selectedCoste !== null && this.selectedExpansion !== null
  //       ) {
  //       if(carta.tipo.idTipo == this.selectedTipo
  //         && carta.rareza.idRareza == this.selectedRareza
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         && carta.costeCarta == this.selectedCoste
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }

  //     // FILTRO DE 5
  //     if(this.selectedRareza !== null && this.selectedExpansion !== null
  //       && this.selectedSubTipo3 !== null && this.selectedCoste !== null && this.selectedSubTipo !== null
  //       ) {
  //       if((this.compararSubtipos(this.selectedSubTipo, carta))
  //         && carta.rareza.idRareza == this.selectedRareza
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         && carta.costeCarta == this.selectedCoste
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     // FILTRO DE 5
  //     if(this.selectedRareza !== null && this.selectedExpansion !== null
  //       && this.selectedSubTipo2 !== null && this.selectedCoste !== null && this.selectedSubTipo !== null
  //       ) {
  //       if((this.compararSubtipos(this.selectedSubTipo, carta))
  //         && carta.rareza.idRareza == this.selectedRareza
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && carta.costeCarta == this.selectedCoste
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     // FILTRO DE 5
  //     if(this.selectedRareza !== null && this.selectedExpansion !== null
  //       && this.selectedSubTipo3 !== null && this.selectedCoste !== null && this.selectedSubTipo2 !== null
  //       ) {
  //       if((this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && carta.rareza.idRareza == this.selectedRareza
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         && carta.costeCarta == this.selectedCoste
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }

  //     // FILTRO DE 5
  //     if(this.selectedExpansion !== null && this.selectedTipo !== null
  //       && this.selectedSubTipo3 !== null && this.selectedCoste !== null && this.selectedSubTipo !== null
  //       ) {
  //       if(carta.tipo.idTipo == this.selectedTipo
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         && carta.costeCarta == this.selectedCoste
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     // FILTRO DE 5
  //     if(this.selectedExpansion !== null && this.selectedTipo !== null
  //       && this.selectedSubTipo2 !== null && this.selectedCoste !== null && this.selectedSubTipo !== null
  //       ) {
  //       if(carta.tipo.idTipo == this.selectedTipo
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && carta.costeCarta == this.selectedCoste
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     // FILTRO DE 5
  //     if(this.selectedExpansion !== null && this.selectedTipo !== null
  //       && this.selectedSubTipo3 !== null && this.selectedCoste !== null && this.selectedSubTipo2 !== null
  //       ) {
  //       if(carta.tipo.idTipo == this.selectedTipo
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         && carta.costeCarta == this.selectedCoste
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }


  //     // FILTRO DE 4
  //     if(this.selectedRareza !== null
  //       && this.selectedSubTipo !== null && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null
  //       ) {
  //       if(carta.rareza.idRareza == this.selectedRareza
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }

  //     // FILTRO DE 4
  //     if(this.selectedTipo !== null
  //       && this.selectedSubTipo !== null && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null
  //       ) {
  //       if(carta.tipo.idTipo == this.selectedTipo
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }

  //     // FILTRO DE 4
  //     if(this.selectedExpansion !== null
  //       && this.selectedSubTipo !== null && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null
  //       ) {
  //       if(carta.expansion.idExpansion == this.selectedExpansion
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }

  //     // FILTRO DE 4
  //     if(this.selectedCoste !== null
  //       && this.selectedSubTipo !== null && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null
  //       ) {
  //       if(carta.costeCarta == this.selectedCoste
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     // FILTRO DE 4
  //     if(this.selectedCoste !== null
  //       && this.selectedSubTipo !== null && this.selectedSubTipo2 !== null && this.selectedExpansion !== null
  //       ) {
  //       if(carta.costeCarta == this.selectedCoste
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }

  //     // FILTRO DE 4
  //     if(this.selectedCoste !== null
  //       && this.selectedSubTipo !== null && this.selectedSubTipo3 !== null && this.selectedExpansion !== null
  //       ) {
  //       if(carta.costeCarta == this.selectedCoste
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     // FILTRO DE 4
  //     if(this.selectedCoste !== null
  //       && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null && this.selectedExpansion !== null
  //       ) {
  //       if(carta.costeCarta == this.selectedCoste
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     // FILTRO DE 4
  //     if(this.selectedCoste !== null
  //       && this.selectedSubTipo !== null && this.selectedRareza !== null && this.selectedExpansion !== null
  //       ) {
  //       if(carta.costeCarta == this.selectedCoste
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         && carta.rareza.idRareza == this.selectedRareza
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     // FILTRO DE 4
  //     if(this.selectedCoste !== null
  //       && this.selectedSubTipo2 !== null && this.selectedRareza !== null && this.selectedExpansion !== null
  //       ) {
  //       if(carta.costeCarta == this.selectedCoste
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && carta.rareza.idRareza == this.selectedRareza
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     // FILTRO DE 4
  //     if(this.selectedCoste !== null
  //       && this.selectedSubTipo3 !== null && this.selectedRareza !== null && this.selectedExpansion !== null
  //       ) {
  //       if(carta.costeCarta == this.selectedCoste
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         && carta.rareza.idRareza == this.selectedRareza
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     // FILTRO DE 4
  //     if(this.selectedCoste !== null
  //       && this.selectedSubTipo !== null && this.selectedTipo !== null && this.selectedExpansion !== null
  //       ) {
  //       if(carta.costeCarta == this.selectedCoste
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         && carta.tipo.idTipo == this.selectedTipo
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     // FILTRO DE 4
  //     if(this.selectedCoste !== null
  //       && this.selectedSubTipo2 !== null && this.selectedTipo !== null && this.selectedExpansion !== null
  //       ) {
  //       if(carta.costeCarta == this.selectedCoste
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && carta.tipo.idTipo == this.selectedTipo
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     // FILTRO DE 4
  //     if(this.selectedCoste !== null
  //       && this.selectedSubTipo3 !== null && this.selectedTipo !== null && this.selectedExpansion !== null
  //       ) {
  //       if(carta.costeCarta == this.selectedCoste
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         && carta.tipo.idTipo == this.selectedTipo
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }

  //     // FILTRO DE 4
  //     if(this.selectedCoste !== null
  //       && this.selectedRareza !== null && this.selectedTipo !== null && this.selectedExpansion !== null
  //       ) {
  //       if(carta.costeCarta == this.selectedCoste
  //         && carta.rareza.idRareza == this.selectedRareza
  //         && carta.tipo.idTipo == this.selectedTipo
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }

  //     // FILTRO DE 4 AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
  //     if(this.selectedCoste !== null
  //       && this.selectedSubTipo !== null && this.selectedSubTipo3 !== null && this.selectedRareza !== null
  //       ) {
  //       if(carta.costeCarta == this.selectedCoste
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         && carta.rareza.idRareza == this.selectedRareza
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     // FILTRO DE 4
  //     if(this.selectedCoste !== null
  //       && this.selectedSubTipo !== null && this.selectedSubTipo2 !== null && this.selectedRareza !== null
  //       ) {
  //       if(carta.costeCarta == this.selectedCoste
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && carta.rareza.idRareza == this.selectedRareza
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     // FILTRO DE 4
  //     if(this.selectedCoste !== null
  //       && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null && this.selectedRareza !== null
  //       ) {
  //       if(carta.costeCarta == this.selectedCoste
  //         && carta.rareza.idRareza == this.selectedRareza
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     // FILTRO DE 4
  //     if(this.selectedTipo !== null
  //       && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null && this.selectedRareza !== null
  //       ) {
  //       if(carta.tipo.idTipo == this.selectedTipo
  //         && carta.rareza.idRareza == this.selectedRareza
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     // FILTRO DE 4
  //     if(this.selectedTipo !== null
  //       && this.selectedSubTipo !== null && this.selectedSubTipo3 !== null && this.selectedRareza !== null
  //       ) {
  //       if(carta.tipo.idTipo == this.selectedTipo
  //         && carta.rareza.idRareza == this.selectedRareza
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     // FILTRO DE 4
  //     if(this.selectedTipo !== null
  //       && this.selectedSubTipo !== null && this.selectedSubTipo2 !== null && this.selectedRareza !== null
  //       ) {
  //       if(carta.tipo.idTipo == this.selectedTipo
  //         && carta.rareza.idRareza == this.selectedRareza
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }

  //     // FILTRO DE 4
  //     if(this.selectedTipo !== null
  //       && this.selectedSubTipo !== null && this.selectedCoste !== null && this.selectedRareza !== null
  //       ) {
  //       if(carta.tipo.idTipo == this.selectedTipo
  //         && carta.rareza.idRareza == this.selectedRareza
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         && carta.costeCarta
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     // FILTRO DE 4
  //     if(this.selectedTipo !== null
  //       && this.selectedSubTipo2 !== null && this.selectedCoste !== null && this.selectedRareza !== null
  //       ) {
  //       if(carta.tipo.idTipo == this.selectedTipo
  //         && carta.rareza.idRareza == this.selectedRareza
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && carta.costeCarta
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     // FILTRO DE 4
  //     if(this.selectedTipo !== null
  //       && this.selectedSubTipo3 !== null && this.selectedCoste !== null && this.selectedRareza !== null
  //       ) {
  //       if(carta.tipo.idTipo == this.selectedTipo
  //         && carta.rareza.idRareza == this.selectedRareza
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         && carta.costeCarta
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }

  //     // FILTRO DE 4
  //     if(this.selectedTipo !== null
  //       && this.selectedSubTipo !== null && this.selectedSubTipo3 !== null && this.selectedExpansion !== null
  //       ) {
  //       if(carta.tipo.idTipo == this.selectedTipo
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     // FILTRO DE 4
  //     if(this.selectedTipo !== null
  //       && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null && this.selectedExpansion !== null
  //       ) {
  //       if(carta.tipo.idTipo == this.selectedTipo
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     // FILTRO DE 4
  //     if(this.selectedTipo !== null
  //       && this.selectedSubTipo2 !== null && this.selectedSubTipo2 !== null && this.selectedExpansion !== null
  //       ) {
  //       if(carta.tipo.idTipo == this.selectedTipo
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }

  //     // FILTRO DE 4
  //     if(this.selectedRareza !== null
  //       && this.selectedSubTipo !== null && this.selectedSubTipo3 !== null && this.selectedExpansion !== null
  //       ) {
  //       if(carta.rareza.idRareza == this.selectedRareza
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     // FILTRO DE 4
  //     if(this.selectedRareza !== null
  //       && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null && this.selectedExpansion !== null
  //       ) {
  //       if(carta.rareza.idRareza == this.selectedRareza
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     // FILTRO DE 4
  //     if(this.selectedRareza !== null
  //       && this.selectedSubTipo2 !== null && this.selectedSubTipo2 !== null && this.selectedExpansion !== null
  //       ) {
  //       if(carta.rareza.idRareza == this.selectedRareza
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }

  //     // FILTRO DE 4
  //     if(this.selectedCoste !== null
  //       && this.selectedSubTipo2 !== null && this.selectedSubTipo2 !== null && this.selectedTipo !== null
  //       ) {
  //       if(carta.costeCarta == this.selectedCoste
  //         && carta.tipo.idTipo == this.selectedTipo
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     // FILTRO DE 4
  //     if(this.selectedCoste !== null
  //       && this.selectedSubTipo2 !== null && this.selectedSubTipo2 !== null && this.selectedTipo !== null
  //       ) {
  //       if(carta.costeCarta == this.selectedCoste
  //         && carta.tipo.idTipo == this.selectedTipo
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     // FILTRO DE 4
  //     if(this.selectedCoste !== null
  //       && this.selectedSubTipo2 !== null && this.selectedSubTipo2 !== null && this.selectedTipo !== null
  //       ) {
  //       if(carta.costeCarta == this.selectedCoste
  //         && carta.tipo.idTipo == this.selectedTipo
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }


  //     // FILTRO DE 4
  //     if(this.selectedExpansion !== null
  //       && this.selectedSubTipo !== null && this.selectedTipo !== null && this.selectedRareza !== null
  //       ) {
  //       if(carta.rareza.idRareza == this.selectedRareza
  //         && carta.tipo.idTipo == this.selectedTipo
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     // FILTRO DE 4
  //     if(this.selectedExpansion !== null
  //       && this.selectedSubTipo2 !== null && this.selectedTipo !== null && this.selectedRareza !== null
  //       ) {
  //       if(carta.rareza.idRareza == this.selectedRareza
  //         && carta.tipo.idTipo == this.selectedTipo
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     // FILTRO DE 4
  //     if(this.selectedExpansion !== null
  //       && this.selectedSubTipo3 !== null && this.selectedTipo !== null && this.selectedRareza !== null
  //       ) {
  //       if(carta.rareza.idRareza == this.selectedRareza
  //         && carta.tipo.idTipo == this.selectedTipo
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }






  //     // FILTROS DE A 3
  //     if(this.selectedRareza !== null && this.selectedTipo !== null && this.selectedExpansion !== null) {
  //       if(carta.rareza.idRareza == this.selectedRareza
  //         && carta.tipo.idTipo == this.selectedTipo
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     if(this.selectedRareza !== null && this.selectedTipo !== null && this.selectedCoste !== null) {
  //       if(carta.rareza.idRareza == this.selectedRareza
  //         && carta.tipo.idTipo == this.selectedTipo
  //         && carta.costeCarta == this.selectedCoste
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     if(this.selectedCoste !== null && this.selectedExpansion !== null && this.selectedRareza !== null) {
  //       if(carta.rareza.idRareza == this.selectedRareza
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         && carta.costeCarta == this.selectedCoste
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     //



  //     // FILTROS DE A 3
  //     if(this.selectedRareza !== null && this.selectedSubTipo !== null && this.selectedSubTipo2 !== null) {
  //       if(carta.rareza.idRareza == this.selectedRareza
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     if(this.selectedRareza !== null && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null) {
  //       if(carta.rareza.idRareza == this.selectedRareza
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     if(this.selectedRareza !== null && this.selectedSubTipo3 !== null && this.selectedSubTipo !== null) {
  //       if(carta.rareza.idRareza == this.selectedRareza
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     //

  //     // FILTROS DE A 3
  //     if(this.selectedExpansion !== null && this.selectedSubTipo !== null && this.selectedSubTipo2 !== null) {
  //       if(carta.expansion.idExpansion == this.selectedExpansion
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     if(this.selectedExpansion !== null && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null) {
  //       if(carta.expansion.idExpansion == this.selectedExpansion
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     if(this.selectedExpansion !== null && this.selectedSubTipo3 !== null && this.selectedSubTipo !== null) {
  //       if(carta.expansion.idExpansion == this.selectedExpansion
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     //

  //     // FILTROS DE A 3
  //     if(this.selectedTipo !== null && this.selectedSubTipo !== null && this.selectedSubTipo2 !== null) {
  //       if(carta.tipo.idTipo == this.selectedTipo
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     if(this.selectedTipo !== null && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null) {
  //       if(carta.tipo.idTipo == this.selectedTipo
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     if(this.selectedTipo !== null && this.selectedSubTipo3 !== null && this.selectedSubTipo !== null) {
  //       if(carta.tipo.idTipo == this.selectedTipo
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     //

  //     // FILTROS DE A 3
  //     if(this.selectedCoste !== null && this.selectedSubTipo !== null && this.selectedSubTipo2 !== null) {
  //       if(carta.costeCarta == this.selectedCoste
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     if(this.selectedCoste !== null && this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null) {
  //       if(carta.costeCarta == this.selectedCoste
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     if(this.selectedCoste !== null && this.selectedSubTipo3 !== null && this.selectedSubTipo !== null) {
  //       if(carta.costeCarta == this.selectedCoste
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     //

  //     // FILTRO DE 3
  //     if(this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null && this.selectedSubTipo !== null) {
  //       if((this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }


  //     // FILTRO DE 3
  //     if(this.selectedExpansion !== null && this.selectedTipo !== null && this.selectedCoste !== null) {
  //       if(carta.costeCarta == this.selectedCoste
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         && carta.tipo.idTipo == this.selectedTipo
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     // FILTRO DE 3
  //     if(this.selectedExpansion !== null && this.selectedTipo !== null && this.selectedSubTipo !== null) {
  //       if((this.compararSubtipos(this.selectedSubTipo, carta))
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         && carta.tipo.idTipo == this.selectedTipo
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     // FILTRO DE 3
  //     if(this.selectedExpansion !== null && this.selectedTipo !== null && this.selectedSubTipo2 !== null) {
  //       if((this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         && carta.tipo.idTipo == this.selectedTipo
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     // FILTRO DE 3
  //     if(this.selectedExpansion !== null && this.selectedTipo !== null && this.selectedSubTipo3 !== null) {
  //       if((this.compararSubtipos(this.selectedSubTipo3, carta))
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         && carta.tipo.idTipo == this.selectedTipo
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     // FILTRO DE 3
  //     if(this.selectedExpansion !== null && this.selectedRareza !== null && this.selectedSubTipo !== null) {
  //       if((this.compararSubtipos(this.selectedSubTipo, carta))
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         && carta.rareza.idRareza == this.selectedRareza
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     // FILTRO DE 3
  //     if(this.selectedExpansion !== null && this.selectedRareza !== null && this.selectedSubTipo2 !== null) {
  //       if((this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         && carta.rareza.idRareza == this.selectedRareza
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     // FILTRO DE 3
  //     if(this.selectedExpansion !== null && this.selectedRareza !== null && this.selectedSubTipo3 !== null) {
  //       if((this.compararSubtipos(this.selectedSubTipo3, carta))
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         && carta.rareza.idRareza == this.selectedRareza
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }

  //     // FILTRO DE 3
  //     if(this.selectedExpansion !== null && this.selectedCoste !== null && this.selectedSubTipo !== null) {
  //       if((this.compararSubtipos(this.selectedSubTipo, carta))
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         && carta.costeCarta == this.selectedCoste
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     // FILTRO DE 3
  //     if(this.selectedExpansion !== null && this.selectedCoste !== null && this.selectedSubTipo2 !== null) {
  //       if((this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         && carta.costeCarta == this.selectedCoste
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     // FILTRO DE 3
  //     if(this.selectedExpansion !== null && this.selectedCoste !== null && this.selectedSubTipo3 !== null) {
  //       if((this.compararSubtipos(this.selectedSubTipo3, carta))
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         && carta.costeCarta == this.selectedCoste
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }

  //     // FILTRO DE 3
  //     if(this.selectedRareza !== null && this.selectedCoste !== null && this.selectedSubTipo !== null) {
  //       if((this.compararSubtipos(this.selectedSubTipo, carta))
  //         && carta.rareza.idRareza == this.selectedRareza
  //         && carta.costeCarta == this.selectedCoste
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     // FILTRO DE 3
  //     if(this.selectedRareza !== null && this.selectedCoste !== null && this.selectedSubTipo2 !== null) {
  //       if((this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && carta.rareza.idRareza == this.selectedRareza
  //         && carta.costeCarta == this.selectedCoste
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     // FILTRO DE 3
  //     if(this.selectedRareza !== null && this.selectedCoste !== null && this.selectedSubTipo3 !== null) {
  //       if((this.compararSubtipos(this.selectedSubTipo3, carta))
  //         && carta.rareza.idRareza == this.selectedRareza
  //         && carta.costeCarta == this.selectedCoste
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }

  //     // FILTRO DE 3
  //     if(this.selectedTipo !== null && this.selectedCoste !== null && this.selectedSubTipo !== null) {
  //       if((this.compararSubtipos(this.selectedSubTipo, carta))
  //         && carta.tipo.idTipo == this.selectedTipo
  //         && carta.costeCarta == this.selectedCoste
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     // FILTRO DE 3
  //     if(this.selectedTipo !== null && this.selectedCoste !== null && this.selectedSubTipo2 !== null) {
  //       if((this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && carta.tipo.idTipo == this.selectedTipo
  //         && carta.costeCarta == this.selectedCoste
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     // FILTRO DE 3
  //     if(this.selectedTipo !== null && this.selectedCoste !== null && this.selectedSubTipo3 !== null) {
  //       if((this.compararSubtipos(this.selectedSubTipo3, carta))
  //         && carta.tipo.idTipo == this.selectedTipo
  //         && carta.costeCarta == this.selectedCoste
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }

  //     // FILTRO DE 3
  //     if(this.selectedTipo !== null && this.selectedRareza !== null && this.selectedSubTipo !== null) {
  //       if((this.compararSubtipos(this.selectedSubTipo, carta))
  //         && carta.tipo.idTipo == this.selectedTipo
  //         && carta.rareza.idRareza == this.selectedRareza
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     // FILTRO DE 3
  //     if(this.selectedTipo !== null && this.selectedRareza !== null && this.selectedSubTipo2 !== null) {
  //       if((this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && carta.tipo.idTipo == this.selectedTipo
  //         && carta.rareza.idRareza == this.selectedRareza
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     // FILTRO DE 3
  //     if(this.selectedTipo !== null && this.selectedRareza !== null && this.selectedSubTipo3 !== null) {
  //       if((this.compararSubtipos(this.selectedSubTipo3, carta))
  //         && carta.tipo.idTipo == this.selectedTipo
  //         && carta.rareza.idRareza == this.selectedRareza
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }


  //     // FILTROS DE A 2
  //     if(this.selectedTipo !== null && this.selectedRareza !== null) {
  //       if(carta.tipo.idTipo == this.selectedTipo
  //         && carta.rareza.idRareza == this.selectedRareza
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }

  //     // FILTROS DE A 2
  //     if(this.selectedTipo !== null && this.selectedExpansion !== null) {
  //       if(carta.tipo.idTipo == this.selectedTipo
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }

  //     // FILTROS DE A 2
  //     if(this.selectedTipo !== null && this.selectedCoste !== null) {
  //       if(carta.tipo.idTipo == this.selectedTipo
  //         && carta.costeCarta == this.selectedCoste
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }

  //     // FILTROS DE A 2
  //     if(this.selectedRareza !== null && this.selectedCoste !== null) {
  //       if(carta.rareza.idRareza == this.selectedRareza
  //         && carta.costeCarta == this.selectedCoste
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }

  //     // FILTROS DE A 2
  //     if(this.selectedExpansion !== null && this.selectedCoste !== null) {
  //       if(carta.expansion.idExpansion == this.selectedExpansion
  //         && carta.costeCarta == this.selectedCoste
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }

  //     // FILTROS DE A 2
  //     if(this.selectedRareza !== null && this.selectedExpansion !== null) {
  //       if(carta.rareza.idRareza == this.selectedRareza
  //         && carta.expansion.idExpansion == this.selectedExpansion
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }

  //     // FILTROS DE A 2
  //     if(this.selectedTipo !== null && this.selectedSubTipo !== null) {
  //       if(carta.tipo.idTipo == this.selectedTipo
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     if(this.selectedTipo !== null && this.selectedSubTipo2 !== null) {
  //       if(carta.tipo.idTipo == this.selectedTipo
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     if(this.selectedTipo !== null && this.selectedSubTipo3 !== null) {
  //       if(carta.tipo.idTipo == this.selectedTipo
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }

  //     // FILTROS DE A 2
  //     if(this.selectedRareza !== null && this.selectedSubTipo !== null) {
  //       if(carta.rareza.idRareza == this.selectedRareza
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     if(this.selectedRareza !== null && this.selectedSubTipo2 !== null) {
  //       if(carta.rareza.idRareza == this.selectedRareza
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     if(this.selectedRareza !== null && this.selectedSubTipo3 !== null) {
  //       if(carta.rareza.idRareza == this.selectedRareza
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     //

  //     // FILTROS DE A 2
  //     if(this.selectedExpansion !== null && this.selectedSubTipo !== null) {
  //       if(carta.expansion.idExpansion == this.selectedExpansion
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     if(this.selectedExpansion !== null && this.selectedSubTipo2 !== null) {
  //       if(carta.expansion.idExpansion == this.selectedExpansion
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     if(this.selectedExpansion !== null && this.selectedSubTipo3 !== null) {
  //       if(carta.expansion.idExpansion == this.selectedExpansion
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     //

  //     // FILTROS DE A 2
  //     if(this.selectedCoste !== null && this.selectedSubTipo !== null) {
  //       if(carta.costeCarta == this.selectedCoste
  //         && (this.compararSubtipos(this.selectedSubTipo, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     if(this.selectedCoste !== null && this.selectedSubTipo2 !== null) {
  //       if(carta.costeCarta == this.selectedCoste
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     if(this.selectedCoste !== null && this.selectedSubTipo3 !== null) {
  //       if(carta.costeCarta == this.selectedCoste
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }

  //     // FILTROS DE A 2
  //     if(this.selectedSubTipo !== null && this.selectedSubTipo2 !== null) {
  //       if((this.compararSubtipos(this.selectedSubTipo, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo2, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     if(this.selectedSubTipo !== null && this.selectedSubTipo3 !== null) {
  //       if((this.compararSubtipos(this.selectedSubTipo, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     if(this.selectedSubTipo2 !== null && this.selectedSubTipo3 !== null) {
  //       if((this.compararSubtipos(this.selectedSubTipo2, carta))
  //         && (this.compararSubtipos(this.selectedSubTipo3, carta))
  //         )
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     //

  //     // FILTROS DE 1
  //     if(this.selectedRareza !== null) {
  //       if(carta.rareza.idRareza == this.selectedRareza)
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     if(this.selectedExpansion !== null) {
  //       if(carta.expansion.idExpansion == this.selectedExpansion)
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }
  //     if(this.selectedTipo !== null) {
  //       if(carta.tipo.idTipo == this.selectedTipo)
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }

  //     if(this.selectedCoste !== null) {
  //       if(carta.costeCarta == this.selectedCoste)
  //         {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //     }

  //     if(this.selectedSubTipo !== null) {
  //       return this.compararSubtipos(this.selectedSubTipo, carta);
  //     }
  //     if(this.selectedSubTipo2 !== null) {
  //       return this.compararSubtipos(this.selectedSubTipo2, carta);
  //     }
  //     if(this.selectedSubTipo3 !== null) {
  //       return this.compararSubtipos(this.selectedSubTipo3, carta);
  //     }

  //     return false;
  //   });
  // }

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
      //this.cartas = dato;
      this.cartas = dato.filter(carta => carta.expansion.visibilidad);
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

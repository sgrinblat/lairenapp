import { ChangeDetectorRef, Component, ElementRef, Inject, Input, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { Carta } from 'src/app/objetos/carta';
import { DeckListCarta } from 'src/app/objetos/deckListCarta';
import { Decklist } from 'src/app/objetos/decklist';
import { Rareza } from 'src/app/objetos/rareza';
import { Tipo } from 'src/app/objetos/tipo';
import { Expansion } from 'src/app/objetos/expansion';
import { Usuario } from 'src/app/objetos/usuario';
import { ConexionService } from 'src/app/services/conexion.service';

import { encode } from 'base64-arraybuffer';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

import { Plugins, PermissionState} from '@capacitor/core';
import { ModalController, Platform, ToastController } from '@ionic/angular';
const { Permissions } = Plugins;

import { AlertController } from '@ionic/angular';
import { ImageBovedaDeckComponent } from './image-boveda-deck/image-boveda-deck.component';
import { ImageGeneratorComponent } from './image-generator/image-generator.component';
import { ImageSidedeckComponent } from './image-sidedeck/image-sidedeck.component';
import { KeepAwake } from '@capacitor-community/keep-awake';
import { Subtipo } from 'src/app/objetos/subtipo';
import { SelectSubtypesModalComponent } from 'src/app/select-subtypes-modal/select-subtypes-modal.component';
import { SelectMultipleControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'app-decklist-individual',
  templateUrl: './decklist-individual.page.html',
  styleUrls: ['./decklist-individual.page.scss'],
})
export class DecklistIndividualPage implements OnInit {
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
  decklists!: Decklist[];
  costes: number[] = [];
  deck: Decklist;

  expansiones: Observable<Expansion[]>;
  rarezas: Rareza[] = [];
  tipos: Tipo[] = [];
  subtipos: Subtipo[] = [];
  supertipo: Subtipo[] = [];

  reino: Carta[];
  boveda: Carta[];
  sidedeck: Carta[];

  textoEntrada: string = '';
  cartasPegadas: Carta[] = [];
  nombresSubtipoUnicos: string[] = [];

  banderaLista = true;
  banderaEdicion = false;
  banderaEdicionParaCopy = false;
  imagenGenerada: string;
  imagenGeneradaBoveda: string;
  imagenGeneradaSideDeck: string;
  imagenCombinada: string;
  banderaImagenGenerada: boolean = false;
  filteredCartasNuevo: Carta[] = [];
  banderaFiltroExcluyente: boolean = false;
  banderaFiltroIncluyente: boolean = false;

  constructor(
    private conexion: ConexionService,
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private alertController: AlertController,
    private platform: Platform,
    private cdr: ChangeDetectorRef,
    private toastController: ToastController,
    public modalController: ModalController,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.reino = new Array<Carta>();
    this.boveda = new Array<Carta>();
    this.sidedeck = new Array<Carta>();
  }

  @Input()
  decklistId: number | null = null;

  @ViewChild('imageGenerator') imageGeneratorComponent: ImageGeneratorComponent;
  @ViewChild('imageBoveda') ImageBovedaDeckComponent: ImageBovedaDeckComponent;
  @ViewChild('imageSideDeck') ImageSidedeckComponent: ImageSidedeckComponent;


  /**
   * Activa la función para mantener la pantalla encendida
   */
  ionViewWillEnter(): void {
    //
    KeepAwake.keepAwake().then(() => {
      console.log('La pantalla se mantendrá encendida');
    }).catch((error) => {
      console.error('Error al intentar mantener la pantalla encendida', error);
    });
  }

  /**
   * Permite que la pantalla se apague cuando se abandona este componente
   */
  ionViewWillLeave(): void {
    KeepAwake.allowSleep().then(() => {
      console.log('La pantalla puede apagarse');
    }).catch((error) => {
      console.error('Error al intentar permitir que la pantalla se apague', error);
    });
  }



  procesarTexto() {
    const secciones = this.textoEntrada.split(/Reino:|Bóveda:|Side Deck:/).slice(1);

    // Procesa cada sección temporalmente
    const reinoTemporal = this.procesarSeccion(secciones[0]);
    const bovedaTemporal = this.procesarSeccion(secciones[1]);
    const sidedeckTemporal = this.procesarSeccion(secciones[2]);

    // Realiza el chequeo después de procesar las secciones temporalmente
    const cartasExcedidas = this.chequearCartasExcedidas([reinoTemporal, bovedaTemporal, sidedeckTemporal]);

    if (cartasExcedidas.length > 0) {

      (async () => {
        const alert = await this.alertController.create({
          header: 'Error en la lista',
          message: `Las siguientes cartas tienen 5 o más unidades: ${cartasExcedidas.join(', ')}`,
          buttons: ['OK'],
          cssClass: 'my-custom-class',
        });

        await alert.present();
      })();

      return;
    }

    // Si no hay fallas, asigna los valores a las propiedades definitivas
    this.reino = reinoTemporal;
    this.boveda = bovedaTemporal;
    this.sidedeck = sidedeckTemporal;

    (async () => {
      const alert = await this.alertController.create({
        header: '¡Éxito!',
        message: 'La lista se ha procesado con éxito.',
        buttons: ['OK'],
        cssClass: 'my-custom-class',
      });

      await alert.present();
    })();

  }

  procesarSeccion(seccion: string): Carta[] {
    const lineas = seccion.trim().split('\n');
    const cartasEncontradas: Carta[] = [];

    for (const linea of lineas) {
      const lineaTrimmed = linea.trim();
      if (!lineaTrimmed) continue; // Ignora líneas vacías

      const partes = lineaTrimmed.split(' x');
      const nombreCarta = partes[0];
      const cantidad = partes.length > 1 ? parseInt(partes[1]) : 1;

      const cartaEncontrada = this.cartas.find(carta => carta.nombreCarta === nombreCarta);

      if (cartaEncontrada) {
        for (let i = 0; i < cantidad; i++) {
          cartasEncontradas.push(cartaEncontrada);
        }
      }
    }

    return cartasEncontradas;
  }

  chequearCartasExcedidas(secciones: Carta[][]): string[] {
    const conteoCartas: { [nombre: string]: number } = {};

    // Sumar todas las cartas de las secciones
    for (const seccion of secciones) {
      for (const carta of seccion) {
        if (!conteoCartas[carta.nombreCarta]) {
          conteoCartas[carta.nombreCarta] = 0;
        }
        conteoCartas[carta.nombreCarta]++;
      }
    }

    // Filtrar cartas con 5 o más unidades
    return Object.keys(conteoCartas).filter(nombre => conteoCartas[nombre] >= 5);
  }

  /**
   * Si existe una decklist en la url, busca la información y la renderiza en el front
   * Al igual que el buscador de cartas, también recupera cartas, tipos, rarezas, expansiones, costes
   */
  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.decklistId = params['id'];

      if (this.decklistId != null) {
        this.conexion.getDecklistById(this.decklistId).subscribe((decklist) => {
          this.deck = decklist;
          this.conexion.getUsuarioActual().subscribe((usuario: Usuario) => {
            if (decklist.usuario.id == usuario.id) {
              let deckReino: DeckListCarta[] = decklist.reino;
              let deckBoveda: DeckListCarta[] = decklist.boveda;
              let deckSidedeck: DeckListCarta[] = decklist.sidedeck;

              deckReino.forEach((element) => {
                if (element.tipo == 'reino') {
                  this.reino.push(element.carta);
                }
              });

              deckBoveda.forEach((element) => {
                if (element.tipo == 'boveda') {
                  this.boveda.push(element.carta);
                }
              });

              deckSidedeck.forEach((element) => {
                if (element.tipo == 'sidedeck') {
                  this.sidedeck.push(element.carta);
                }
              });

              this.banderaEdicion = true;
            }
          });
        });
      }
    });

    this.soloDominacion();
    this.expansiones = this.conexion.getTodasLasExpas();

    this.conexion.getTodasLasRarezas().pipe(
      map(rarezas => {
        const order = ['BRONCE', 'PLATA', 'ORO', 'DIAMANTE', 'ESMERALDA'];
        return rarezas.sort((a, b) => order.indexOf(a.nombreRareza) - order.indexOf(b.nombreRareza));
      })
    ).subscribe(rarezas => {
      this.rarezas = rarezas;
    });

    this.conexion
      .getTodasLosTipos()
      .pipe(
        map((tipos) =>
          tipos.sort((a, b) => a.nombreTipo.localeCompare(b.nombreTipo))
        )
      )
      .subscribe((tipos) => {
        this.tipos = tipos;
        this.tipos = this.tipos.filter(tipo => tipo.idTipo !== 30);
      });

      this.conexion.getTodasLosSubTipos().pipe(
        map(subtipos => subtipos.sort((a, b) => a.nombreSubTipo.localeCompare(b.nombreSubTipo)))
      ).subscribe(subtipos => {
        this.supertipo = subtipos.filter(subtipo => subtipo.nombreSubTipo === 'REALEZA');
        this.subtipos = subtipos.filter(subtipo => subtipo.nombreSubTipo !== 'REALEZA');
      });
  }


  searchByName() {
    this.filteredCartas = this.cartas.filter(carta =>
      carta.nombreCarta.includes(this.searchName)
    );
  }

  searchByText() {
    this.filteredCartas = this.cartas.filter(carta =>
      carta.textoCarta.toLowerCase().includes(this.searchText.toLowerCase())
    );
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


      this.nombresSubtipoUnicos = this.extraerNombresSubtipoUnicos(this.cartas);
      const opcionesAEliminar = ["RAPIDA", "SAGRADO", "COMUN", undefined, "REALEZA"];
      this.nombresSubtipoUnicos = this.nombresSubtipoUnicos.filter(opcion => !opcionesAEliminar.includes(opcion));

      // Establece las cartas filtradas
      this.filteredCartasNuevo = this.cartas;
    });
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

      this.nombresSubtipoUnicos = this.extraerNombresSubtipoUnicos(this.cartas);
      const opcionesAEliminar = ["RAPIDA", "SAGRADO", "COMUN", undefined, "REALEZA"];
      this.nombresSubtipoUnicos = this.nombresSubtipoUnicos.filter(opcion => !opcionesAEliminar.includes(opcion));
    });
  }

  extraerNombresSubtipoUnicos(cartas: Carta[]): string[] {
    const nombresSubtipo = new Set<string>();
    cartas.forEach(carta => {
      // Añadimos los nombres de subtipo de ambos campos a nuestro Set para garantizar unicidad
      nombresSubtipo.add(carta.subtipo?.nombreSubTipo);
      nombresSubtipo.add(carta.subtipo2?.nombreSubTipo);
    });
    return Array.from(nombresSubtipo).filter(nombre => nombre !== undefined).sort();
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

  /**
   * Obtiene las decklists del usuario logueado
   */
  obtenerDecklists() {
    this.conexion.getTodasLasDecklists().subscribe((dato) => {
      this.decklists = dato;
    });
  }

  /**
   * Chequea las cartas añadidas en la lista para que no se repitan las cartas de mismo nombre, y así mostrar un solo item en el front
   * @param lista lista de cartas que se va generando cuando el usuario añade cartas
   * @returns la lista de cartas filtrada
   */
  getCartasUnicas(lista: Carta[]): Carta[] {
    return lista.filter(
      (carta, i, self) =>
        i === self.findIndex((c) => c.nombreCarta === carta.nombreCarta)
    );
  }

  /**
   * Cuenta la cantidad de cartas que tiene por cada nombre repetido de carta
   * @param carta carta a chequear el nombre
   * @param lista lista de cartas que se va generando cuando el usuario añade cartas
   * @returns la lista de cartas filtrada
   */
  getCantidad(carta: Carta, lista: Carta[]): number {
    return lista.filter((c) => c.nombreCarta === carta.nombreCarta).length;
  }

  /**
   * Añade cartas a la lista, según el tipo de carta que tiene
   * Tesoros -> Boveda
   * Unidades, monumentos y acciones -> Reino
   * El sidedeck puede tener cualquier tipo de carta
   * En el reino puede repetirse hasta 4 veces la misma carta. En la boveda, solo puede haber 1 copia de la misma carta
   * @param carta carta a añadir
   * @returns
   */
  agregarCarta(carta: Carta) {
    this.banderaEdicionParaCopy = true;
    if (this.banderaLista) {
      if (carta.tipo.nombreTipo == 'TESORO') {
        if(carta.nombreCarta == "TESORO GENERICO") {
          this.boveda.push(carta);
          return;
        } else {
          const cantidadPrincipal = this.getCantidad(carta, this.boveda);
          const cantidadSide = this.getCantidad(carta, this.sidedeck);
          if (cantidadPrincipal + cantidadSide > 0) {

            (async () => {
              const alert = await this.alertController.create({
                header: 'No tan rápido, general',
                message: 'No puedes agregar a tu Bóveda más de 1 copia del mismo Tesoro!',
                buttons: ['OK'],
                cssClass: 'my-custom-class',
              });

              await alert.present();
            })();

            return;
          }
        }

        this.boveda.push(carta);
        this.boveda.sort((a, b) => {
          if (a.nombreCarta < b.nombreCarta) {
            return -1;
          }
          if (a.nombreCarta > b.nombreCarta) {
            return 1;
          }
          return 0;
        });
      } else {
        const cantidadPrincipal = this.getCantidad(carta, this.reino);
        const cantidadSide = this.getCantidad(carta, this.sidedeck);
        if (cantidadPrincipal + cantidadSide > 3) {

          (async () => {
            const alert = await this.alertController.create({
              header: 'No tan rápido, general',
              message: 'No puedes agregar a tu Reino más de 4 copias de la misma carta!',
              buttons: ['OK'],
              cssClass: 'my-custom-class',
            });

            await alert.present();
          })();
          return;
        }

        this.reino.push(carta);
        this.reino.sort((a, b) => {
          if (a.nombreCarta < b.nombreCarta) {
            return -1;
          }
          if (a.nombreCarta > b.nombreCarta) {
            return 1;
          }
          return 0;
        });
      }
    } else {
      if (carta.tipo.nombreTipo == 'TESORO') {
        (async () => {
          const alert = await this.alertController.create({
            header: 'No tan rápido, general',
            message: 'No puedes agregar tesoros a tu sidedeck!',
            buttons: ['OK'],
            cssClass: 'my-custom-class',
          });

          await alert.present();
        })();
      } else if (carta.tipo.nombreTipo != 'TESORO') {
        const cantidadPrincipal = this.getCantidad(carta, this.reino);
        const cantidadSide = this.getCantidad(carta, this.sidedeck);

        if (cantidadPrincipal + cantidadSide > 3) {

          (async () => {
            const alert = await this.alertController.create({
              header: 'No tan rápido, general',
              message: 'No puedes agregar a tu Reino más de 4 copias de la misma carta!',
              buttons: ['OK'],
              cssClass: 'my-custom-class',
            });

            await alert.present();
          })();

          return;
        }
      }

      this.sidedeck.push(carta);
      this.sidedeck.sort((a, b) => {
        if (a.nombreCarta < b.nombreCarta) {
          return -1;
        }
        if (a.nombreCarta > b.nombreCarta) {
          return 1;
        }
        return 0;
      });
    }
  }

  /**
   * Elimina carta de la lista
   * @param carta carta a eliminar
   * @param lista lista de cartas creada por el usuario
   */
  eliminarCarta(carta: Carta, lista: Carta[]) {
    const index = lista.findIndex((item) => item === carta);
    if (index !== -1) {
      lista.splice(index, 1);
    }
  }

  /**
   * Nos informa la cantidad de cartas que hay
   * @param lista lista de cartas creada por el usuario
   * @returns
   */
  getTotalCartas(lista: Carta[]) {
    return lista.length;
  }

  getTotalPuntajeBoveda(lista: Carta[]): number {
    return lista.reduce((total, carta) => total + carta.numeroTesoro, 0);
  }

  agregarGenerico() {
    let generico: Carta | undefined;
    generico = this.cartas.find(carta => carta.idCarta === 175);
    if (generico) {
      this.boveda.push(generico);
    }
  }

  /**
   * Botón que el usuario selecciona para añadir cartas al sidedeck o al reino/boveda
   */
  switchearEntreMainAndSidedeck() {
    this.banderaLista = !this.banderaLista;

    if (this.banderaLista) {
      (async () => {
        const alert = await this.alertController.create({
          header: 'Cambiando!',
          message: 'Ahora las cartas que clickees estarás agregandolas a tu mazo principal',
          buttons: ['OK'],
          cssClass: 'my-custom-class',
        });

        await alert.present();
      })();

    } else {
      (async () => {
        const alert = await this.alertController.create({
          header: 'Cambiando!',
          message: 'Ahora las cartas que clickees estarás agregandolas a tu Sidedeck',
          buttons: ['OK'],
          cssClass: 'my-custom-class',
        });

        await alert.present();
      })();
    }
  }

  /**
   * Persiste la decklist creada por el usuario en la base de datos
   * @returns
   */
  async guardarDecklist() {
    // let sagrados: number = 0;

    // for (const item of this.boveda) {
    //   if(item.subtipo) {
    //     if (item.subtipo.nombreSubTipo.includes('SAGRADO')) {
    //       sagrados++;
    //     }
    //   }

    // }

    // if (sagrados > 3) {
    //   const alert = await this.alertController.create({
    //     header: 'Error',
    //     message: 'No puedes tener más de 3 tesoros sagrados en tu decklist',
    //     buttons: ['OK'],
    //     cssClass: 'my-custom-class',
    //   });

    //   await alert.present();
    //   return;
    // }

    if (this.getTotalPuntajeBoveda(this.boveda) > 30) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'No puedes superar los 30 puntos en tu bóveda!',
        buttons: ['OK'],
        cssClass: 'my-custom-class',
      });

      await alert.present();
      return;
    }

    if (this.reino.length < 45 || this.reino.length > 60 || this.boveda.length != 15 || this.sidedeck.length != 7) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Ten en cuenta que tu reino debe tener mínimo 45 cartas, máximo 60 cartas. Tu bóveda es de 15 cartas, y tu sidedeck es de 7 cartas.',
        buttons: ['OK'],
        cssClass: 'my-custom-class',
      });

      await alert.present();
      return;
    }

    let deck: Decklist = new Decklist();
    deck.reino = [];
    deck.boveda = [];
    deck.sidedeck = [];
    deck.fechaDecklist = new Date();

    this.reino.forEach(async (element) => {
      let deckListCarta: DeckListCarta = new DeckListCarta();
      if(element.baneada == true) {
        const alert = await this.alertController.create({
          header: 'Error',
          message: `La carta ${element.nombreCarta} está prohibida en Dominación.`,
          buttons: ['OK'],
          cssClass: 'my-custom-class',
        });
        await alert.present();
        return;
      } else {
        deckListCarta.carta = element;
        deckListCarta.tipo = 'reino';
        deck.reino.push(deckListCarta);
      }
    });

    this.boveda.forEach(async (element) => {
      let deckListCarta: DeckListCarta = new DeckListCarta();
      if(element.baneada == true) {
        const alert = await this.alertController.create({
          header: 'Error',
          message: `La carta ${element.nombreCarta} está prohibida en Dominación.`,
          buttons: ['OK'],
          cssClass: 'my-custom-class',
        });
        await alert.present();
        return;
      } else {
        deckListCarta.carta = element;
        deckListCarta.tipo = 'boveda';
        deck.boveda.push(deckListCarta);
      }
    });

    this.sidedeck.forEach(async (element) => {
      let deckListCarta: DeckListCarta = new DeckListCarta();
      if(element.baneada == true) {
        const alert = await this.alertController.create({
          header: 'Error',
          message: `La carta ${element.nombreCarta} está prohibida en Dominación.`,
          buttons: ['OK'],
          cssClass: 'my-custom-class',
        });
        await alert.present();
        return;
      } else {
        deckListCarta.carta = element;
        deckListCarta.tipo = 'sidedeck';
        deck.sidedeck.push(deckListCarta);
      }
    });


    const isValidSubtypes = await this.presentSelectSubtypesModal();
    if (!isValidSubtypes) {
      await this.presentAlert('Más de 2 subtipos', 'La validación de subtipos ha fallado. Asegurate no estar usando más de 2 subtipos de unidad en el Reino y el Sidedeck.');
      return;
    }

    const portadaDecklist = await this.presentAlertInput('Ingresa una imagen', 'Guarda la URL de la imagen que quieres como portada para tu decklist (recomendamos usar un uploader de imagen como https://postimages.org)');
    if (portadaDecklist !== undefined) {
      deck.portadaDecklist = portadaDecklist;

      const nombreDecklist = await this.presentAlertInput('Pon un nombre para tu decklist', 'Ingresa el nombre de tu decklist');
      if (nombreDecklist !== undefined) {
        deck.nombreDecklist = nombreDecklist;

        this.conexion.getUsuarioActual().subscribe((usuario: Usuario) => {
          if (!this.banderaEdicion) {
            this.banderaEdicion = true;
            this.conexion.crearDecklistJugador(deck, usuario.id).subscribe(
              (dato) => {
                this.presentAlert('Guardado!', `Tu decklist ${nombreDecklist} ha sido guardada.`);
                this.banderaEdicionParaCopy = false;
                this.cdr.detectChanges();
                this.route.navigate(["/tabs/tab3"]);
              },
              (error) => {
                this.presentAlert('Error!', 'Algo salió mal');
              }
            );
          } else {
            this.banderaEdicion = true;
            this.conexion.putDecklist(this.decklistId, deck).subscribe(
              (dato) => {
                this.presentAlert('Guardado!', `Tu decklist ${nombreDecklist} ha sido actualizada.`);
                this.banderaEdicionParaCopy = false;
                this.cdr.detectChanges();
                this.route.navigate(["/tabs/tab3"]);
              },
              (error) => {
                this.presentAlert('Error!', 'Algo salió mal');
              }
            );
          }
        });
      }
    }
  }


  userSelection: string;



  async presentSelectSubtypesModal(): Promise<boolean> {
    const modal = await this.modalController.create({
      component: SelectSubtypesModalComponent,
      componentProps: { nombresSubtipoUnicos: this.nombresSubtipoUnicos }
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();

    if (data) {
      const isValid = this.validateSelections(data.selectedSubtype1, data.selectedSubtype2);
      return isValid; // Devuelve el resultado de la validación.
    }

    return false; // Por defecto, devuelve false si no hay datos.
  }


  validateSelections(selectedSubtype1: string, selectedSubtype2: string): boolean {
    const arraysParaRevisar = [this.reino, this.sidedeck];

    for (const array of arraysParaRevisar) {
      for (const carta of array) {
        if ((carta.tipo.nombreTipo === "ACCION")) {
          if(!carta.subtipo2) {
            continue; // Ignoramos estas cartas según las reglas dadas
          } else {
            const subtipoAccion =
            selectedSubtype1.includes(carta.subtipo2?.nombreSubTipo) || selectedSubtype2.includes(carta.subtipo2?.nombreSubTipo) ||
            selectedSubtype1.includes(carta.subtipo?.nombreSubTipo) || selectedSubtype2.includes(carta.subtipo?.nombreSubTipo);
                if (!subtipoAccion) {
              return false; // Detenemos la función si encontramos una no coincidencia
            }
          }
        }

        if(carta.tipo.nombreTipo === "UNIDAD") {
          if(carta.subtipo.nombreSubTipo === "MIMETICO") {
            continue;
          }
        }

        if(carta.tipo.nombreTipo === "MONUMENTO") {
          if(!carta.subtipo) {
            continue; // Ignoramos estas cartas según las reglas dadas
          } else {
            const subtipoMonumento = selectedSubtype1.includes(carta.subtipo?.nombreSubTipo) ||
            selectedSubtype2.includes(carta.subtipo?.nombreSubTipo) ||
                selectedSubtype1.includes(carta.subtipo2?.nombreSubTipo) ||
                selectedSubtype2.includes(carta.subtipo2?.nombreSubTipo);
                if (!subtipoMonumento) {
              return false; // Detenemos la función si encontramos una no coincidencia
            }
          }
        }

        if ((carta.tipo.nombreTipo === "TESORO")) {
          continue; // Ignoramos estas cartas según las reglas dadas
        }

        // Chequeo de subtipos
        const subtipoCoincide = selectedSubtype1.includes(carta.subtipo?.nombreSubTipo) || selectedSubtype2.includes(carta.subtipo2?.nombreSubTipo)
        || selectedSubtype1.includes(carta.subtipo2?.nombreSubTipo) || selectedSubtype2.includes(carta.subtipo.nombreSubTipo);
        if (!subtipoCoincide) {
          return false; // Detenemos la función si encontramos una no coincidencia
        }
      }
    }
    return true;

  }


  /**
   * Comodín de alerta que le permite al usuario ingresar datos
   * @param header texto de cabecera
   * @param message texto de body
   * @returns
   */
  async presentAlertInput(header: string, message: string) {
    return new Promise<string | undefined>((resolve) => {
      this.alertController.create({
        header,
        message,
        inputs: [
          {
            name: 'input',
            type: 'text',
            placeholder: 'Ingresa aquí',
          },
        ],
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => resolve(undefined),
          },
          {
            text: 'Guardar',
            handler: (data) => resolve(data.input),
          },
        ],
      }).then(alert => alert.present());
    });
  }

  /**
   * Comodín de alerta con un botón de guardar para reconfirmar
   * @param header texto de cabecera
   * @param message texto de body
   * @returns
   */
  async presentAlertGuardar(header: string, message: string) {
    return new Promise<string | undefined>((resolve) => {
      this.alertController.create({
        header,
        message,
        inputs: [
          {
            name: 'input',
            type: 'text',
            placeholder: 'Ingresa aquí',
          },
        ],
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => resolve(undefined),
          },
          {
            text: 'Guardar',
            handler: (data) => {
              this.presentToast("Se está generado tu imagen, espera por favor!");
              setTimeout(() => {
                resolve(data.input);
            }, 100);
            }
          },
        ],
      }).then(alert => alert.present());
    });
  }

  /**
   * Comodín de alerta
   * @param header texto de cabecera
   * @param message texto de body
   */
  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
      cssClass: 'my-custom-class',
    });

    await alert.present();
  }


  /**
   * Copia la lista creada por el usuario al portapapeles, para hacer un simple control+V o "pegar" en algún chat o donde desee
   */
  copyToClipboard() {
    if(this.banderaEdicionParaCopy) {
      this.presentAlert('Aún no!', `Por favor guarda primero para chequear si la decklist está bien`);
    } else {
      let str = 'Reino: (total: ' + this.getTotalCartas(this.reino) + ')\n';
    this.getCartasUnicas(this.reino).forEach((carta) => {
      str +=
        carta.nombreCarta + ' x' + this.getCantidad(carta, this.reino) + '\n';
    });

    str += `\n Bóveda: (total: ${this.getTotalCartas(this.boveda)}) \n`;
    this.getCartasUnicas(this.boveda).forEach((carta) => {
      str +=
        carta.nombreCarta + ' x' + this.getCantidad(carta, this.boveda) + '\n';
    });

    str += `\n Side Deck: (total: ${this.getTotalCartas(this.sidedeck)}) \n`;
    this.getCartasUnicas(this.sidedeck).forEach((carta) => {
      str +=
        carta.nombreCarta +
        ' x' +
        this.getCantidad(carta, this.sidedeck) +
        '\n';
    });

    navigator.clipboard.writeText(str).then(
      async () => {
        const alert = await this.alertController.create({
          header: 'Copiado!',
          message: 'Ya tienes toda la lista copiada en tu portapapeles!',
          buttons: ['OK'],
          cssClass: 'my-custom-class',
        });

        await alert.present();
      },
    );
    }

  }


  opcionesVisibles = false;

  /**
   * Muestra las opciones adicionales en el front (copiar al portapapeles, generar imagen, guardar decklist)
   */
  toggleOpciones() {
    this.opcionesVisibles = !this.opcionesVisibles;
  }

  /**
   * Genera la imagen de la decklist, combinando las 3 imágenes individuales generadas por cada micro-componente
   */
  async generarImagen() {
    if(!this.banderaEdicion) {
      this.presentAlert('Aún no!', `Por favor guarda primero para chequear si la decklist está bien`);
    } else {
      let decklist: string;
      let nombreCompleto: string;

      decklist = await this.presentAlertInput('Pon un nombre para tu decklist', 'Ingresa el nombre de tu decklist');
      if (decklist !== undefined) {
        nombreCompleto = await this.presentAlertGuardar('Cuál es tu nombre y apellido?', 'Ingresa tu nombre y apellido completo');
        if (nombreCompleto !== undefined) {
          const image1Promise = new Promise<string>((resolve) => {
            this.onImageGenerated = (imageUrl: string) => {
              resolve(imageUrl);
            };
            this.imageGeneratorComponent.generarImagen(decklist, nombreCompleto);
          });

          const image2Promise = new Promise<string>((resolve) => {
            this.onImageGeneratedBoveda = (imageUrl: string) => {
              resolve(imageUrl);
            };
            this.ImageBovedaDeckComponent.generarImagen(decklist, nombreCompleto);
          });

          const image3Promise = new Promise<string>((resolve) => {
            this.onImageGeneratedSideDeck = (imageUrl: string) => {
              resolve(imageUrl);
            };
            this.ImageSidedeckComponent.generarImagen(decklist, nombreCompleto);
          });

          // Esperar a que todas las imágenes estén generadas
          Promise.all([image1Promise, image2Promise, image3Promise])
            .then(([img1, img2, img3]) => {
              this.combinaImagenes(img1, img2, img3);
              this.banderaImagenGenerada = true;

              this.presentAlert(
                'Imagen generada correctamente',
                `Ya puedes volver a presionar el botón para descargar la imagen de tu decklist ${decklist}!`
              );
            });
        }
      }
    }
  }

  /**
   * Imagen del Reino generada
   * @param imageUrl imagen generada por el componente image-generator
   */
  onImageGenerated(imageUrl: string) {
    this.imagenGenerada = imageUrl;
  }

  /**
   * Imagen de la Boveda generada
   * @param imageUrl imagen generada por el componente image-boveda-deck
   */
  onImageGeneratedBoveda(imageUrl: string) {
      this.imagenGeneradaBoveda = imageUrl;
  }

  /**
   * Imagen del Sidedeck generada
   * @param imageUrl imagen generada por el componente image-sidedeck
   */
  onImageGeneratedSideDeck(imageUrl: string) {
      this.imagenGeneradaSideDeck = imageUrl;
  }


  /**
   * Combina las 3 imágenes individuales en 1 sola grande
   * @param img1Src imagen generada por image-generator
   * @param img2Src imagen generada por image-boveda-deck
   * @param img3Src imagen generada por image-sidedeck
   */
  combinaImagenes(img1Src: string, img2Src: string, img3Src: string) {
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');

    let img1 = new Image();
    let img2 = new Image();
    let img3 = new Image();

    let img1Promise = new Promise((resolve, reject) => {
        img1.onload = resolve;
        img1.onerror = reject;
        img1.src = img1Src;
    });

    let img2Promise = new Promise((resolve, reject) => {
        img2.onload = resolve;
        img2.onerror = reject;
        img2.src = img2Src;
    });

    let img3Promise = new Promise((resolve, reject) => {
        img3.onload = resolve;
        img3.onerror = reject;
        img3.src = img3Src;
    });

    Promise.all([img1Promise, img2Promise, img3Promise]).then(() => {
        canvas.width = img1.width;  // Asume que todas las imágenes tienen el mismo ancho
        canvas.height = img1.height + img2.height + img3.height;

        ctx.drawImage(img1, 0, 0);
        ctx.drawImage(img2, 0, img1.height);
        ctx.drawImage(img3, 0, img1.height + img2.height);

        this.imagenCombinada = canvas.toDataURL('image/png');
    }).catch(error => {
        console.error("Hubo un error cargando las imágenes: ", error);
    });
  }

  /**
   * Descarga la imagen en el almacenamiento del telefono
   * @param imageUrl la imagen final combinada
   * @param imageName el nombre de la decklist
   * @returns
   */
  async downloadAndSaveImage(imageUrl: string, imageName: string) {
    // Verifica si la aplicación se está ejecutando en un dispositivo real
    if (!this.isRealDevice()) {
      console.error('This function can only be executed on a real device');
      return;
    }

    // Descarga la imagen convirtiendola en base64 para que sea más liviano
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const base64 = this.arrayBufferToBase64(arrayBuffer);

    const timestamp = new Date().getTime();
    const uniqueImageName = `${imageName}_${timestamp}.jpg`;

    // Guarda la imagen en el almacenamiento externo del dispositivo
    const result = await Filesystem.writeFile({
      path: 'Download/' + uniqueImageName,
      data: base64,
      directory: Directory.ExternalStorage,
    });

    console.log('Image saved at', result.uri);
    this.presentAlert('Descargado!', 'Tu decklist fue descargada, podes verla en tus archivos recientes');
  }

  /**
   * Chequea si se está ejecutando en un telefono real
   * @returns
   */
  isRealDevice(): boolean {
    return this.platform.is('cordova') || this.platform.is('capacitor');
  }

  /**
   * Convierte la imagen a base64
   * @param buffer
   * @returns
   */
  arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  /**
   * Comodín de toast
   * @param mensaje mensaje del toast
   */
  async presentToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'top',
      color: 'primary'
    });
    toast.present();
  }

  getCardImage(card: Carta): string {
    // Retorna la ruta local de la carta
    return `../../../../../assets/decklists/${card.nombreCarta}.webp`;
  }

  onImageError(event: Event, card: Carta): void {
    // Cambia la imagen rota a la URL remota o una imagen predeterminada
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = card.urlImagen;
  }

}



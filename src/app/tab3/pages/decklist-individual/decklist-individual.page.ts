import { Component, ElementRef, Inject, Input, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
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


import { AlertController } from '@ionic/angular';
import { ImageBovedaDeckComponent } from './image-boveda-deck/image-boveda-deck.component';
import { ImageGeneratorComponent } from './image-generator/image-generator.component';
import { ImageSidedeckComponent } from './image-sidedeck/image-sidedeck.component';

@Component({
  selector: 'app-decklist-individual',
  templateUrl: './decklist-individual.page.html',
  styleUrls: ['./decklist-individual.page.scss'],
})
export class DecklistIndividualPage implements OnInit {
  searchText: string | null = null;
  selectedRareza: number | null = null;
  selectedExpansion: number | null = null;
  selectedTipo: number | null = null;
  selectedCoste: number | null = null;
  filteredCartas: Carta[] = [];
  cartas!: Carta[];
  decklists!: Decklist[];
  costes: number[] = [];
  deck: Decklist;

  expansiones: Observable<Expansion[]>;
  rarezas: Rareza[] = [];
  tipos: Tipo[] = [];

  reino: Carta[];
  boveda: Carta[];
  sidedeck: Carta[];

  banderaLista = true;
  banderaEdicion = false;
  imagenGenerada: string;
  imagenGeneradaBoveda: string;
  imagenGeneradaSideDeck: string;
  imagenCombinada: string;
  banderaImagenGenerada: boolean = false;

  constructor(
    private conexion: ConexionService,
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private alertController: AlertController,
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

  async generarImagen() {
    let decklist: string;
    let nombreCompleto: string;

    decklist = await this.presentAlertInput('Pon un nombre para tu decklist', 'Ingresa el nombre de tu decklist');
    if (decklist !== undefined) {
      nombreCompleto = await this.presentAlertInput('Cuál es tu nombre y apellido?', 'Ingresa tu nombre y apellido completo');
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




  onImageGenerated(imageUrl: string) {
    this.imagenGenerada = imageUrl;
  }

  onImageGeneratedBoveda(imageUrl: string) {
      this.imagenGeneradaBoveda = imageUrl;
  }

  onImageGeneratedSideDeck(imageUrl: string) {
      this.imagenGeneradaSideDeck = imageUrl;
  }


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

    this.conexion
      .getTodasLosTipos()
      .pipe(
        map((tipos) =>
          tipos.sort((a, b) => a.nombreTipo.localeCompare(b.nombreTipo))
        )
      )
      .subscribe((tipos) => {
        this.tipos = tipos;
      });
  }

  onRarezaChange(selectedRareza: number) {
    this.selectedRareza = selectedRareza;
    this.filterCartas();
  }

  onExpansionChange(selectedExpansion: number) {
    this.selectedExpansion = selectedExpansion;
    this.filterCartas();
  }

  onTipoChange(selectedTipo: number) {
    this.selectedTipo = selectedTipo;
    this.filterCartas();
  }

  onCosteChange(selectedCoste: number) {
    this.selectedCoste = selectedCoste;
    this.filterCartas();
  }

  searchByText() {
    this.filteredCartas = this.cartas.filter((carta) => {
      if (carta.nombreCarta.includes(this.searchText)) {
        return true;
      } else {
        return false;
      }
    });
  }

  filterCartas() {
    this.filteredCartas = this.cartas.filter((carta) => {
      if (
        this.selectedExpansion !== null &&
        this.selectedRareza !== null &&
        this.selectedTipo !== null &&
        this.selectedCoste !== null
      ) {
        if (
          carta.rareza.idRareza == this.selectedRareza &&
          carta.tipo.idTipo == this.selectedTipo &&
          carta.expansion.idExpansion == this.selectedExpansion &&
          carta.costeCarta == this.selectedCoste
        ) {
          return true;
        } else {
          return false;
        }
      }

      if (
        this.selectedExpansion !== null &&
        this.selectedRareza !== null &&
        this.selectedTipo !== null
      ) {
        if (
          carta.rareza.idRareza == this.selectedRareza &&
          carta.tipo.idTipo == this.selectedTipo &&
          carta.expansion.idExpansion == this.selectedExpansion
        ) {
          return true;
        } else {
          return false;
        }
      }

      if (
        this.selectedRareza !== null &&
        this.selectedTipo !== null &&
        this.selectedCoste !== null
      ) {
        if (
          carta.rareza.idRareza == this.selectedRareza &&
          carta.tipo.idTipo == this.selectedTipo &&
          carta.costeCarta == this.selectedCoste
        ) {
          return true;
        } else {
          return false;
        }
      }

      if (
        this.selectedExpansion !== null &&
        this.selectedTipo !== null &&
        this.selectedCoste !== null
      ) {
        if (
          carta.tipo.idTipo == this.selectedTipo &&
          carta.expansion.idExpansion == this.selectedExpansion &&
          carta.costeCarta == this.selectedCoste
        ) {
          return true;
        } else {
          return false;
        }
      }

      if (
        this.selectedExpansion !== null &&
        this.selectedRareza !== null &&
        this.selectedCoste !== null
      ) {
        if (
          carta.rareza.idRareza == this.selectedRareza &&
          carta.expansion.idExpansion == this.selectedExpansion &&
          carta.costeCarta == this.selectedCoste
        ) {
          return true;
        } else {
          return false;
        }
      }

      if (this.selectedExpansion !== null && this.selectedRareza !== null) {
        if (
          carta.rareza.idRareza == this.selectedRareza &&
          carta.expansion.idExpansion == this.selectedExpansion
        ) {
          return true;
        } else {
          return false;
        }
      }

      if (this.selectedExpansion !== null && this.selectedTipo !== null) {
        if (
          carta.tipo.idTipo == this.selectedTipo &&
          carta.expansion.idExpansion == this.selectedExpansion
        ) {
          return true;
        } else {
          return false;
        }
      }

      if (this.selectedTipo !== null && this.selectedCoste !== null) {
        if (
          carta.tipo.idTipo == this.selectedTipo &&
          carta.costeCarta == this.selectedCoste
        ) {
          return true;
        } else {
          return false;
        }
      }

      if (this.selectedExpansion !== null && this.selectedCoste !== null) {
        if (
          carta.expansion.idExpansion == this.selectedExpansion &&
          carta.costeCarta == this.selectedCoste
        ) {
          return true;
        } else {
          return false;
        }
      }

      if (this.selectedRareza !== null && this.selectedCoste !== null) {
        if (
          carta.rareza.idRareza == this.selectedRareza &&
          carta.costeCarta == this.selectedCoste
        ) {
          return true;
        } else {
          return false;
        }
      }

      if (this.selectedRareza !== null && this.selectedTipo !== null) {
        if (
          carta.tipo.idTipo == this.selectedTipo &&
          carta.rareza.idRareza == this.selectedRareza
        ) {
          return true;
        } else {
          return false;
        }
      }

      if (this.selectedRareza !== null) {
        if (carta.rareza.idRareza == this.selectedRareza) {
          return true;
        } else {
          return false;
        }
      }
      if (this.selectedExpansion !== null) {
        if (carta.expansion.idExpansion == this.selectedExpansion) {
          return true;
        } else {
          return false;
        }
      }
      if (this.selectedTipo !== null) {
        if (carta.tipo.idTipo == this.selectedTipo) {
          return true;
        } else {
          return false;
        }
      }

      if (this.selectedCoste !== null) {
        if (carta.costeCarta == this.selectedCoste) {
          return true;
        } else {
          return false;
        }
      }

      return false;
    });
  }

  obtenerCartas() {
    this.conexion.getTodasLasCartasOrdenadas().subscribe((dato) => {
      this.cartas = dato;
      this.costes = this.getUniqueCostesCartas(this.cartas);
      this.costes = this.costes.sort((a, b) => b - a);
    });
  }

  getUniqueCostesCartas(cartas: Carta[]): number[] {
    let costes: number[] = cartas.map((carta) => carta.costeCarta);
    let uniqueCostes: number[] = [...new Set(costes)];
    return uniqueCostes;
  }

  obtenerDecklists() {
    this.conexion.getTodasLasDecklists().subscribe((dato) => {
      this.decklists = dato;
    });
  }

  getCartasUnicas(lista: Carta[]): Carta[] {
    return lista.filter(
      (carta, i, self) =>
        i === self.findIndex((c) => c.nombreCarta === carta.nombreCarta)
    );
  }

  getCantidad(carta: Carta, lista: Carta[]): number {
    return lista.filter((c) => c.nombreCarta === carta.nombreCarta).length;
  }

  agregarCarta(carta: Carta) {
    if (this.banderaLista) {
      if (carta.tipo.nombreTipo == 'TESORO' || carta.tipo.nombreTipo == 'TESORO - SAGRADO') {
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
      if (
        carta.tipo.nombreTipo == 'TESORO' ||
        carta.tipo.nombreTipo == 'TESORO - SAGRADO'
      ) {
        const cantidadPrincipal = this.getCantidad(carta, this.boveda);
        const cantidadSide = this.getCantidad(carta, this.sidedeck);
        if (cantidadPrincipal + cantidadSide > 0) {

          (async () => {
            const alert = await this.alertController.create({
              header: 'No tan rápido, general',
              message: 'No puedes agregar a tu Side más de 1 copia del mismo Tesoro!',
              buttons: ['OK'],
              cssClass: 'my-custom-class',
            });

            await alert.present();
          })();

          return;
        }

      } else if (carta.tipo.nombreTipo != 'TESORO' && carta.tipo.nombreTipo != 'TESORO - SAGRADO') {
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

  eliminarCarta(carta: Carta, lista: Carta[]) {
    const index = lista.findIndex((item) => item === carta);
    if (index !== -1) {
      lista.splice(index, 1);
    }
  }

  getTotalCartas(lista: Carta[]) {
    return lista.length;
  }

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

  async guardarDecklist() {
    let sagrados: number = 0;

    for (const item of this.boveda) {
      if (item.tipo.nombreTipo === 'TESORO - SAGRADO') {
        sagrados++;
      }
    }

    if (sagrados > 3) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'No puedes tener más de 3 tesoros sagrados en tu decklist',
        buttons: ['OK'],
        cssClass: 'my-custom-class',
      });

      await alert.present();
      return;
    }

    if (this.reino.length < 45 || this.reino.length > 60 || this.boveda.length != 15 || this.sidedeck.length != 10) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Ten en cuenta que tu reino debe tener mínimo 45 cartas, máximo 60 cartas. Tu bóveda es de 15 cartas, y tu sidedeck es de 10 cartas.',
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

    this.reino.forEach((element) => {
      let deckListCarta: DeckListCarta = new DeckListCarta();
      deckListCarta.carta = element;
      deckListCarta.tipo = 'reino';
      deck.reino.push(deckListCarta);
    });

    this.boveda.forEach((element) => {
      let deckListCarta: DeckListCarta = new DeckListCarta();
      deckListCarta.carta = element;
      deckListCarta.tipo = 'boveda';
      deck.boveda.push(deckListCarta);
    });

    this.sidedeck.forEach((element) => {
      let deckListCarta: DeckListCarta = new DeckListCarta();
      deckListCarta.carta = element;
      deckListCarta.tipo = 'sidedeck';
      deck.sidedeck.push(deckListCarta);
    });

    const portadaDecklist = await this.presentAlertInput('Ingresa una imagen', 'Guarda la URL de la imagen que quieres como portada para tu decklist (recomendamos usar un uploader de imagen como https://postimages.org)');
    if (portadaDecklist !== undefined) {
      deck.portadaDecklist = portadaDecklist;

      const nombreDecklist = await this.presentAlertInput('Pon un nombre para tu decklist', 'Ingresa el nombre de tu decklist');
      if (nombreDecklist !== undefined) {
        deck.nombreDecklist = nombreDecklist;

        this.conexion.getUsuarioActual().subscribe((usuario: Usuario) => {
          if (!this.banderaEdicion) {
            this.conexion.crearDecklistJugador(deck, usuario.id).subscribe(
              (dato) => {
                this.presentAlert('Guardado!', `Tu decklist ${nombreDecklist} ha sido guardada.`);
              },
              (error) => {
                this.presentAlert('Error!', 'Algo salió mal');
              }
            );
          } else {
            this.conexion.putDecklist(this.decklistId, deck).subscribe(
              (dato) => {
                this.presentAlert('Guardado!', `Tu decklist ${nombreDecklist} ha sido actualizada.`);
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

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
      cssClass: 'my-custom-class',
    });

    await alert.present();
  }


  copyToClipboard() {
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

  onImageLoad(event: Event) {
    const imageElement = event.target as HTMLImageElement;
    const elementRef = new ElementRef(imageElement);
    elementRef.nativeElement.classList.add('fade-in');
  }


  opcionesVisibles = false;

  toggleOpciones() {
    this.opcionesVisibles = !this.opcionesVisibles;
  }

}



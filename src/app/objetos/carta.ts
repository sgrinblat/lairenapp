import { Expansion } from './expansion';
import { Rareza } from './rareza';
import { Subtipo } from './subtipo';
import { Tipo } from './tipo';

export class Carta {
  idCarta!: number;
  nombreCarta!: string;
  costeCarta!: number;
  urlImagen!: string;
  textoCarta!: string;
  flavorCarta!: string;
  rulingCarta!: string;

  baneada!: boolean;

  valorAtaque!: number;
  valorDefensa!: number;
  numeroTesoro!: number;

  urlImagen1!: string;
  urlImagen2!: string;
  urlImagen3!: string;
  urlImagen4!: string;
  urlImagen5!: string;
  urlImagen6!: string;
  urlImagen7!: string;
  urlImagen8!: string;
  urlImagen9!: string;
  urlImagen10!: string;

  expansion!: Expansion;
  rareza!: Rareza;

  tipo!: Tipo;
  tipo2!: Tipo;

  subtipo!: Subtipo;
  subtipo2!: Subtipo;
  subtipo3!: Subtipo;
}

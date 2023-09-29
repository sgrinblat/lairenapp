import { DeckListCarta } from "./deckListCarta";
import { Usuario } from "./usuario";

export class Decklist {
  id!: number;
  nombreDecklist!: string;
  portadaDecklist!: string;
  fechaDecklist!: Date;

  usuario!: Usuario;

  reino!: DeckListCarta[];
  boveda!: DeckListCarta[];
  sidedeck!: DeckListCarta[];

}

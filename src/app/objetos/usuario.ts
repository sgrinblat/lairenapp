import { Decklist } from "./decklist";
import { Role } from "./role";

export class Usuario {
  id: number;
  username!: string;
  password!: string;

  nombre!: string;
  apellido!: string;
  email!: string;
  emailVerified!: boolean;

  roles!: Role[];

  decklists!: Decklist[];

  getDecklists() {
    return this.decklists;
  }
}

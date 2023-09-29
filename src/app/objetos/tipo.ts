export class Tipo {
  idTipo!: number;
  nombreTipo: string;

  public getNombre(): string {
    return this.nombreTipo;
  }

}

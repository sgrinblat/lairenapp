import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http'
import { Observable, Subject } from 'rxjs';
import { Carta } from '../objetos/carta';
import { Expansion } from '../objetos/expansion';
import { Rareza } from '../objetos/rareza';
import { Tipo } from '../objetos/tipo';
import { Usuario } from '../objetos/usuario';
import { Tienda } from '../objetos/tienda';
import { Decklist } from '../objetos/decklist';
import { Role } from '../objetos/role';
import { Jugador } from '../objetos/jugador';

@Injectable({
  providedIn: 'root'
})
export class ConexionService {

  public loginStatus = new Subject<boolean>();
  private urlBasica = "https://lairentcg.com.ar:8443/api"
  //private urlBasica = "http://localhost:8080"

  private cartaURL = `${this.urlBasica}/carta/cartas`;
  private cartaPublicaURL = `${this.urlBasica}/carta`;
  private expansionURL = `${this.urlBasica}/expansion/expansiones`
  private rarezaURL = `${this.urlBasica}/rareza/rarezas`
  private tipoURL = `${this.urlBasica}/tipo/tipos`
  private decklistURL = `${this.urlBasica}/decklist/decklists`
  private usuarioURL = `${this.urlBasica}/usuarios/user/`
  private tokenURL = `${this.urlBasica}/generate-token`
  private tokenObtenerUserURL = `${this.urlBasica}/actual-usuario`

  constructor(private httpClient: HttpClient) { }

  // este método nos sirve para obtener todas las cartas subidas
  getTodasLasCartas():Observable<Carta[]> {
    return this.httpClient.get<Carta[]>(`${this.cartaURL}`);
  }

  // este método nos sirve para obtener todas las cartas subidas
  getTodasLasCartasOrdenadas():Observable<Carta[]> {
    return this.httpClient.get<Carta[]>(`${this.cartaURL}/ordenadas`);
  }

  // este método nos sirve para ver una carta por su ID
  getCartaById(id:number): Observable<Carta> {
    return this.httpClient.get<Carta>(`${this.cartaURL}/${id}`);
  }

  // este método nos sirve para ver una carta por su ID y se visualiza de manera pública
  getCartaByIdPublic(id:number): Observable<Carta> {
    return this.httpClient.get<Carta>(`${this.cartaPublicaURL}/buscador/open/${id}`);
  }

  // este método nos sirve para ver una carta por una parte de su nombre
  getCartaByPartialName(nombre: string): Observable<Carta> {
    return this.httpClient.get<Carta>(`${this.cartaURL}/nombre/${nombre}`);
  }

  // este método nos sirve para buscar una carta por su coste
  getCartaByCoste(coste: number): Observable<Carta[]> {
    return this.httpClient.get<Carta[]>(`${this.cartaURL}/coste/${coste}`);
  }

  // este método nos sirve para buscar una carta por expansion
  getCartaByExpansion(id: number): Observable<Carta[]> {
    return this.httpClient.get<Carta[]>(`${this.cartaURL}/expansion/${id}`);
  }

  countCartaByExpansion(id: number): Observable<number> {
    return this.httpClient.get<number>(`${this.cartaURL}/expansion/contar/${id}`);
  }

  // este método nos sirve para buscar una carta por rareza
  getCartaByRareza(id: number): Observable<Carta[]> {
    return this.httpClient.get<Carta[]>(`${this.cartaURL}/rareza/${id}`);
  }

  // este método nos sirve para buscar una carta por tipo
  getCartaByTipo(id: number): Observable<Carta[]> {
    return this.httpClient.get<Carta[]>(`${this.cartaURL}/tipo/${id}`);
  }

  // este método nos sirve para registrar una carta
  postCarta(carta: Carta) : Observable<Object> {
    return this.httpClient.post(`${this.cartaURL}/crear`, carta);
  }

  deleteCarta(id: number): Observable<Object> {
    return this.httpClient.delete(`${this.cartaURL}/eliminar/${id}`);
  }

  putCarta(id: number, carta: Carta, ): Observable<Object> {
    return this.httpClient.put(`${this.cartaURL}/actualizar/${id}`, carta);
  }

  // ---------------------- EXPANSIONES ----------------------

  getTodasLasExpas():Observable<Expansion[]> {
    return this.httpClient.get<Expansion[]>(`${this.expansionURL}`);
  }

  getExpaById(id:number): Observable<Expansion> {
    return this.httpClient.get<Expansion>(`${this.expansionURL}/${id}`);
  }

  getExpaByName(nombre: string): Observable<Expansion> {
    return this.httpClient.get<Expansion>(`${this.expansionURL}/nombre/${nombre}`);
  }

  // este método nos sirve para registrar una expansion
  postExpansion(expansion: Expansion) : Observable<Object> {
    return this.httpClient.post(`${this.expansionURL}/crear`, expansion);
  }

  deleteExpansion(id: number): Observable<Object> {
    return this.httpClient.delete(`${this.expansionURL}/eliminar/${id}`);
  }

  putExpansion(id: number, expansion: Expansion, ): Observable<Object> {
    return this.httpClient.put(`${this.expansionURL}/actualizar/${id}`, expansion);
  }

  // ---------------------- RAREZAS ----------------------

  getTodasLasRarezas():Observable<Rareza[]> {
    return this.httpClient.get<Rareza[]>(`${this.rarezaURL}`);
  }

  getRarezaById(id:number): Observable<Rareza> {
    return this.httpClient.get<Rareza>(`${this.rarezaURL}/${id}`);
  }

  getRarezaByName(nombre: string): Observable<Rareza> {
    return this.httpClient.get<Rareza>(`${this.rarezaURL}/nombre/${nombre}`);
  }

  // este método nos sirve para registrar una rareza
  postRareza(rareza: Rareza) : Observable<Object> {
    return this.httpClient.post(`${this.rarezaURL}/crear`, rareza);
  }

  deleteRareza(id: number): Observable<Object> {
    return this.httpClient.delete(`${this.rarezaURL}/eliminar/${id}`);
  }

  putRareza(id: number, rareza: Rareza, ): Observable<Object> {
    return this.httpClient.put(`${this.rarezaURL}/actualizar/${id}`, rareza);
  }



  // ---------------------- TIPOS ----------------------

  getTodasLosTipos():Observable<Tipo[]> {
    return this.httpClient.get<Tipo[]>(`${this.tipoURL}`);
  }

  getTipoById(id:number): Observable<Tipo> {
    return this.httpClient.get<Tipo>(`${this.tipoURL}/${id}`);
  }

  getTipoByName(nombre: string): Observable<Tipo> {
    return this.httpClient.get<Tipo>(`${this.tipoURL}/nombre/${nombre}`);
  }

  // este método nos sirve para registrar un tipo de carta
  postTipo(tipo: Tipo) : Observable<Object> {
    return this.httpClient.post(`${this.tipoURL}/crear`, tipo);
  }

  deleteTipo(id: number): Observable<Object> {
    return this.httpClient.delete(`${this.tipoURL}/eliminar/${id}`);
  }

  putTipo(id: number, tipo: Tipo, ): Observable<Object> {
    return this.httpClient.put(`${this.tipoURL}/actualizar/${id}`, tipo);
  }

  // ---------------------- DECKLISTS ----------------------

  getTodasLasDecklists():Observable<Decklist[]> {
    return this.httpClient.get<Decklist[]>(`${this.decklistURL}`);
  }

  getTodasLasDecklistsDeJugador(id:number):Observable<Decklist[]> {
    return this.httpClient.get<Decklist[]>(`${this.decklistURL}/mostrar/${id}`);
  }

  getDecklistById(id:number): Observable<Decklist> {
    return this.httpClient.get<Decklist>(`${this.decklistURL}/${id}`);
  }

  // este método nos sirve para registrar una decklist
  postDecklist(decklist: Decklist) : Observable<Object> {
    return this.httpClient.post(`${this.decklistURL}/crear`, decklist);
  }

  crearDecklistJugador(decklist: Decklist, id: number) : Observable<Object> {
    return this.httpClient.post(`${this.decklistURL}/crear/${id}`, decklist);
  }

  deleteDecklist(id: number): Observable<Object> {
    return this.httpClient.delete(`${this.decklistURL}/eliminar/${id}`);
  }

  putDecklist(id: number, decklist: Decklist): Observable<Object> {
    return this.httpClient.put(`${this.decklistURL}/actualizar/${id}`, decklist);
  }

  // ---------------------- USUARIOS ----------------------

  private user!: Usuario;
  private roles: Role[] = [];

  setUsuario(user: Usuario) {
    this.user = user;
  }

  setRoles(roles: Role[]) {
    this.roles = roles;
  }

  getTodosLosUsers():Observable<Usuario[]> {
    return this.httpClient.get<Usuario[]>(`${this.usuarioURL}mails`);
  }

  // Este método te permitirá verificar el rol en cualquier parte de tu aplicación.
  isAdmin(): boolean {
    return this.roles.some(role => role.name === 'ADMIN');
  }

  postUsuario(user: Usuario) : Observable<Object> {
    return this.httpClient.post(`${this.usuarioURL}crear`, user);
  }

  requestPasswordReset(email: string): Observable<any> {
    return this.httpClient.post(`${this.usuarioURL}reset_password_request`, email);
  }

  resetPassword(token: string, username: string, newPassword: string): Observable<any> {
    return this.httpClient.post(`${this.usuarioURL}reset_password`, { token, username, newPassword });
  }

  generateToken(loginData: any) {
    return this.httpClient.post(`${this.tokenURL}`, loginData);
  }

  public getCurrentUser(){
    return this.httpClient.get(`${this.tokenObtenerUserURL}`);
  }

  public getUsuarioActual(){
    return this.httpClient.get(`${this.usuarioURL}actual`);
  }

  /**
   *
   * @param token
   * @returns
   */
  iniciarSesion(token: any) {
    localStorage.setItem("token", token);
  }

  verifyEmail(token: string): Observable<any> {
    return this.httpClient.get(`${this.usuarioURL}verify?token=${token}`);
  }

  sesionIniciadaAdmin() {
    let tokenStr = localStorage.getItem("token");
    let tokenStrLocation = localStorage.getItem("location");
    if (tokenStr == undefined || tokenStr == "" || tokenStr == null || tokenStrLocation != '5') {
      return false;
    } else {
      return true;
    }
  }

  sesionIniciadaJugador() {
    let tokenStr = localStorage.getItem("token");
    let tokenStrLocation = localStorage.getItem("location");
    if (tokenStr == undefined || tokenStr == "" || tokenStr == null || tokenStrLocation != '0') {
      return false;
    } else {
      return true;
    }
  }

  getToken() {
    return localStorage.getItem("token");
  }

  setUser(user: any) {
    localStorage.setItem("user", JSON.stringify(user));
  }

  getUser() {
    let userStr = localStorage.getItem("user");
    if (userStr != null) {
      return JSON.parse(userStr);
    } else {
      this.deslogear();
      return null;
    }
  }

  deslogear() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("location");
    return true;
  }

}

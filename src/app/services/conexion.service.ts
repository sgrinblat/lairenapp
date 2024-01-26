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
import { Subtipo } from '../objetos/subtipo';
import { Calendario } from '../objetos/calendario';

@Injectable({
  providedIn: 'root'
})
export class ConexionService {

  public loginStatus = new Subject<boolean>();
  private urlBasica = "https://lairentcg.com.ar:8443/api"
  //private urlBasica = "http://localhost:8080"

  private cartaURL = `${this.urlBasica}/carta/cartas`;
  private cartaPublicaURL = `${this.urlBasica}/carta`;
  private expansionURL = `${this.urlBasica}/expansion/expansiones`;
  private rarezaURL = `${this.urlBasica}/rareza/rarezas`;
  private tipoURL = `${this.urlBasica}/tipo/tipos`;
  private subtipoURL = `${this.urlBasica}/subtipo/subtipos`;
  private decklistURL = `${this.urlBasica}/decklist/decklists`;
  private usuarioURL = `${this.urlBasica}/usuarios/user/`;
  private tokenURL = `${this.urlBasica}/generate-token`;
  private tokenObtenerUserURL = `${this.urlBasica}/actual-usuario`;
  private calendarioPublicoURL = `${this.urlBasica}/calendario/eventos`;

  constructor(private httpClient: HttpClient) { }

  /**
   * este método nos sirve para obtener todas las cartas subidas
   * @returns cartas de la base de datos
   */
  getTodasLasCartas():Observable<Carta[]> {
    return this.httpClient.get<Carta[]>(`${this.cartaURL}`);
  }

  /**
   * este método nos sirve para obtener todas las cartas subidas
   * @returns cartas ordenadas alfabeticamente
   */
  getTodasLasCartasOrdenadas():Observable<Carta[]> {
    return this.httpClient.get<Carta[]>(`${this.cartaURL}/ordenadas`);
  }

  /**
   * este método nos sirve para ver una carta por su ID
   * @param id de la carta
   * @returns carta
   */
  getCartaById(id:number): Observable<Carta> {
    return this.httpClient.get<Carta>(`${this.cartaURL}/${id}`);
  }

  /**
   * este método nos sirve para ver una carta por su ID y se visualiza de manera pública
   * @param id id de carta
   * @returns carta
   */
  getCartaByIdPublic(id:number): Observable<Carta> {
    return this.httpClient.get<Carta>(`${this.cartaPublicaURL}/buscador/open/${id}`);
  }

  /**
   * Obtener todas las expansiones de la base de datos
   * @returns lista de expansiones
   */
  getTodasLasExpas():Observable<Expansion[]> {
    return this.httpClient.get<Expansion[]>(`${this.expansionURL}`);
  }

  /**
   * Obtener todas las rarezas de la base de datos
   * @returns lista de rarezas
   */
  getTodasLasRarezas():Observable<Rareza[]> {
    return this.httpClient.get<Rareza[]>(`${this.rarezaURL}`);
  }

  /**
   * Obtener todos los tipos de la base de datos
   * @returns lista de tipos
   */
  getTodasLosTipos():Observable<Tipo[]> {
    return this.httpClient.get<Tipo[]>(`${this.tipoURL}`);
  }


  // ---------------------- DECKLISTS ----------------------

  /**
   * Obtener todas las decklists
   * @returns
   */
  getTodasLasDecklists():Observable<Decklist[]> {
    return this.httpClient.get<Decklist[]>(`${this.decklistURL}`);
  }

  /**
   * Obtener decklists por jugador
   * @param id id de jugador
   * @returns
   */
  getTodasLasDecklistsDeJugador(id:number):Observable<Decklist[]> {
    return this.httpClient.get<Decklist[]>(`${this.decklistURL}/mostrar/${id}`);
  }

  /**
   * Obtener una decklist especifica
   * @param id id de decklist
   * @returns
   */
  getDecklistById(id:number): Observable<Decklist> {
    return this.httpClient.get<Decklist>(`${this.decklistURL}/${id}`);
  }

  /**
   * Crear una decklist nueva
   * @param decklist decklist creada por el usuario en el front
   * @returns
   */
  crearDecklistJugador(decklist: Decklist, id: number) : Observable<Object> {
    return this.httpClient.post(`${this.decklistURL}/crear/${id}`, decklist);
  }

  /**
   * Eliminar decklist del jugador
   * @param id id de decklist
   * @returns
   */
  deleteDecklist(id: number): Observable<Object> {
    return this.httpClient.delete(`${this.decklistURL}/eliminar/${id}`);
  }

  /**
   * Actualizar la decklist del jugador
   * @param id id de la decklist
   * @param decklist lista de cartas
   * @returns
   */
  putDecklist(id: number, decklist: Decklist): Observable<Object> {
    return this.httpClient.put(`${this.decklistURL}/actualizar/${id}`, decklist);
  }

  // ---------------------- USUARIOS ----------------------

  private user!: Usuario;
  private roles: Role[] = [];

  /**
   * Crea un usuario nuevo en la base de datos
   * @param user usuario con los datos rellenados por la persona en el formulario de registro
   * @returns
   */
  postUsuario(user: Usuario) : Observable<Object> {
    return this.httpClient.post(`${this.usuarioURL}crear`, user);
  }

  /**
   * Envía mail para reiniciar la contraseña si fue solicitado por el usuario
   * @param email mail del usuario
   * @returns
   */
  requestPasswordReset(email: string): Observable<any> {
    return this.httpClient.post(`${this.usuarioURL}reset_password_request`, email);
  }

  /**
   * Genera token jwt del usuario
   * @param loginData
   * @returns
   */
  generateToken(loginData: any) {
    return this.httpClient.post(`${this.tokenURL}`, loginData);
  }

  /**
   * Recupera el usuario leyendo el token
   * @returns
   */
  public getCurrentUser(){
    return this.httpClient.get(`${this.tokenObtenerUserURL}`);
  }

  /**
   * Recupera el usuario por el id
   * @returns
   */
  public getUsuarioActual(){
    return this.httpClient.get(`${this.usuarioURL}actual`);
  }

  /**
   *
   * @param token token almacenado en el localStorage
   */
  iniciarSesion(token: any) {
    localStorage.setItem("token", token);
  }

  /**
   * Chequea al usuario que se busca loguear viendo si tiene su mail ya verificado
   * @param token token almacenado en el localStorage
   * @returns
   */
  verifyEmail(token: string): Observable<any> {
    return this.httpClient.get(`${this.usuarioURL}verify?token=${token}`);
  }

  /**
   * Se inicia sesión el jugador, guarda su info en el localStorage. Se desloguea solo al vencerse el token
   * @returns
   */
  sesionIniciadaJugador() {
    const tokenStr = localStorage.getItem('token');
    const tokenStrLocation = localStorage.getItem('location');

    if (tokenStr == undefined || tokenStr == '' || tokenStr == null || tokenStrLocation != '0') {
      return false;
    } else {
      const payload = JSON.parse(atob(tokenStr.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      if (payload.exp < currentTime) {
        // El token ha expirado, desloguear al usuario
        this.deslogear();
        return false;
      } else {
        return true;
      }
    }
  }

  /**
   * Recupera el token del localStorage
   * @returns token
   */
  getToken() {
    return localStorage.getItem("token");
  }

  /**
   * Guarda al usuario en el localStorage
   * @param user
   */
  setUser(user: any) {
    localStorage.setItem("user", JSON.stringify(user));
  }

  /**
   * Recupera del localStorage info del usuario
   * @returns
   */
  getUser() {
    let userStr = localStorage.getItem("user");
    if (userStr != null) {
      return JSON.parse(userStr);
    } else {
      this.deslogear();
      return null;
    }
  }

  /**
   * Elimina los datos del localStorage cuando el usuario se desloguea
   * @returns boolean
   */
  deslogear() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("location");
    return true;
  }

  // ---------------------- SUBTIPOS ----------------------

  getTodasLosSubTipos():Observable<Subtipo[]> {
    return this.httpClient.get<Subtipo[]>(`${this.subtipoURL}`);
  }

  getSubTipoById(id:number): Observable<Subtipo> {
    return this.httpClient.get<Subtipo>(`${this.subtipoURL}/${id}`);
  }


   // ---------------------- EVENTOS ----------------------

  getEventosPorUbicacion():Observable<Calendario[]> {
    return this.httpClient.get<Calendario[]>(`${this.calendarioPublicoURL}/ubicacion`);
  }

  getEventosPorFecha():Observable<Calendario[]> {
    return this.httpClient.get<Calendario[]>(`${this.calendarioPublicoURL}/ordenados`);
  }

}

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { ConexionService } from './conexion.service';

@Injectable({
  providedIn: 'root'
})
export class JugadorGuard implements CanActivate {
  constructor(private conexion: ConexionService, private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if(this.conexion.sesionIniciadaJugador()){
      return true;
    }

    this.router.navigate(['']);
    return false;
  }

}

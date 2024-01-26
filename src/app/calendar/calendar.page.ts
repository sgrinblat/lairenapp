import { Component, OnInit } from '@angular/core';
import { Calendario } from '../objetos/calendario';
import { ConexionService } from '../services/conexion.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss'],
})
export class CalendarPage  {

  calendarios: Calendario[] = [];
  calendariosFiltrados: Calendario[] = [];
  filtroUbicacion: string = '';

  constructor(private conexion: ConexionService) {}

  ionViewWillEnter(): void {
    this.conexion.getEventosPorFecha().subscribe(
      (data: Calendario[]) => {
        this.calendarios = data;
        this.calendariosFiltrados = data; // Inicializa con todos los eventos
      },
      error => {
        //console.error('Error al obtener eventos', error);
      }
    );
  }



  ngOnChanges(): void {
    this.filtrarPorUbicacion();
  }

  filtrarPorUbicacion(): void {
    if (!this.filtroUbicacion) {
      this.calendariosFiltrados = this.calendarios;
    } else {
      this.calendariosFiltrados = this.calendarios.filter(calendario =>
        calendario.ubicacion.toUpperCase().includes(this.filtroUbicacion.toUpperCase())
      );
    }
  }

}

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ConexionService } from '../services/conexion.service';

import Swal from 'sweetalert2';
import { Usuario } from '../objetos/usuario';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  contactForm!: FormGroup;
  user: Usuario = new Usuario();

  constructor(
    private conexion: ConexionService,
    private readonly fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private route: Router
  ) {
    this.contactForm = fb.group({
      formularioNombreUsuario: [
        '',
        [Validators.required, Validators.minLength(3)],
      ],
      formularioPasswordUsuario: [
        '',
        [Validators.required, Validators.minLength(3)],
      ],
    });
  }

  ngOnInit() {}

  resetPage(): void {
    // Navega primero a una ruta ficticia
    this.route.navigateByUrl('/reset', { skipLocationChange: true }).then(() => {
        // Navega de nuevo a tu ruta actual
        this.route.navigate([""]);
    });
}

  onSubmit() {
    this.user.username = this.contactForm.value.formularioNombreUsuario;
    this.user.password = this.contactForm.value.formularioPasswordUsuario;

    this.conexion.generateToken(this.user).subscribe(
      (dato: any) => {
        console.log(dato);
        this.conexion.iniciarSesion(dato.token);
        this.conexion.getCurrentUser().subscribe((userDetails: any) => {
          if (userDetails.authorities[0].authority == 'JUGADOR') {
            this.conexion.getUsuarioActual().subscribe(
              (user: any) => {
                if (user.emailVerified) {
                  this.conexion.setUser(userDetails);
                  localStorage.setItem('location', '0');
                  console.log("lo lgoraste!!!")
                  this.conexion.loginStatus.next(true);

                } else {
                  console.log("el alert del mail")
                }
              },
              (error) => {
                console.log("inicio fallido")
                this.conexion.loginStatus.next(false);
              }
            );
          } else {
            console.log("inicio fallido")
            this.conexion.loginStatus.next(false);
          }
        });
      },
      (error) => {
        console.log("inicio fallido")
        this.conexion.loginStatus.next(false);
      }
    );
  }


  recuperarPass() {

    Swal.fire({
      title: 'Ingresa el email con el que registraste tu cuenta)',
      input: 'text',
      background: '#2e3031',
      color: '#fff',
      inputAttributes: {
        autocapitalize: 'off',
      },
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.isConfirmed) {
        console.log(result.value);

        this.conexion.requestPasswordReset(result.value).subscribe(
          response => {
            Swal.fire({
              icon: 'success',
              title: 'Email enviado!',
              text: 'Revisá tu mail para restaurar tu contraseña',
              background: '#2e3031',
              color: '#fff',
            });
          },
          error => {
            Swal.fire({
              icon: 'error',
              title: 'El mail no existe',
              text: 'Si sigues teniendo problemas, ponte en contacto con nosotros!',
              background: '#2e3031',
              color: '#fff',
            });
          }
        );
      }
    });

  }



}

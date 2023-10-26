import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ConexionService } from '../services/conexion.service';

import Swal from 'sweetalert2';
import { Usuario } from '../objetos/usuario';
import { AlertController } from '@ionic/angular';

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
    private route: Router,
    private alertController: AlertController,
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
                  console.log("lo lograste!!!")
                  this.presentAlert('Éxito', 'Inicio de sesión exitoso');
                  this.conexion.loginStatus.next(true);
                  this.route.navigate(['/tabs/tab2']);
                } else {
                  this.presentAlert('Fallido', 'No has verificado tu mail');
                  console.log("el alert del mail")
                }
              },
              (error) => {
                console.log("inicio fallido")
                this.presentAlert('Fallido', 'Inicio de sesión fallido');
                this.conexion.loginStatus.next(false);
              }
            );
          } else {
            console.log("inicio fallido")
            this.presentAlert('Fallido', 'Inicio de sesión fallido');
            this.conexion.loginStatus.next(false);
          }
        });
      },
      (error) => {
        console.log("inicio fallido")
        this.presentAlert('Fallido', 'Inicio de sesión fallido');
        this.conexion.loginStatus.next(false);
      }
    );
  }


  async recuperarPass() {
    const alert = await this.alertController.create({
      header: 'Ingresa el email con el que registraste tu cuenta',
      inputs: [
        {
          name: 'email',
          type: 'text',
          placeholder: 'Email',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Guardar',
          handler: (data) => {
            this.conexion.requestPasswordReset(data.email).subscribe(
              (response) => {
                this.presentAlert('Email enviado!', 'Revisá tu mail para restaurar tu contraseña');
              },
              (error) => {
                this.presentAlert('Error', 'El mail no existe. Si sigues teniendo problemas, ponte en contacto con nosotros!');
              }
            );
          },
        },
      ],
    });

    await alert.present();
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK'],
    });

    await alert.present();
  }


}

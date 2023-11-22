import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ConexionService } from '../services/conexion.service';

import { Usuario } from '../objetos/usuario';
import { AlertController, ToastController } from '@ionic/angular';
import { Observable, from } from 'rxjs';
import { ContentfulService } from '../services/contentful.service';


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  contactForm!: FormGroup;
  user: Usuario = new Usuario();
  usuario: Usuario;
  posts$: Observable<any>;

  constructor(
    private conexion: ConexionService,
    private readonly fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private cdr: ChangeDetectorRef,
    private contentfulService: ContentfulService
  ) {
    this.contactForm = fb.group({
      formularioNombreUsuario: [
        '',
        [Validators.required, Validators.minLength(5)],
      ],
      formularioPasswordUsuario: [
        '',
        [Validators.required, Validators.minLength(6)],
      ],
    });
  }

  /**
   * Al entrar al componente, si el usuario está logeado, consume el API de Contentful para recuperar entradas del blog
   */
  ionViewWillEnter() {
    this.verElemento();
    if(this.verElemento() == true) {
      this.posts$ = from(this.contentfulService.getBlogEntriesByCategory("noticia"));
    }
  }

  /**
   * Chequea si un elemento del front debe poder verse o no, conforme a si el usuario está logeado o no
   * @returns boolean
   */
  verElemento() {
    if(this.conexion.sesionIniciadaJugador()){
      return true;
    } else {
      return false;
    }
  }

  /**
   * Cierra sesión del usuario eliminando su info del localStorage
   */
  cerrarSesion() {
    this.conexion.deslogear();
    this.presentToast("Has cerrado tu sesión");
  }

  /**
   * Toma los datos ingresados de los inputs del login, genera un token JWT para almacenar en el localStorage, y chequea también el rol del usuario (solo admite el logueo de un rol "jugador")
   */
  onSubmit() {
    this.presentToast("Espere un momento por favor!");

    this.user.username = this.contactForm.value.formularioNombreUsuario;
    this.user.password = this.contactForm.value.formularioPasswordUsuario;

    this.conexion.generateToken(this.user).subscribe(
      (dato: any) => {
        this.conexion.iniciarSesion(dato.token);
        this.conexion.getCurrentUser().subscribe((userDetails: any) => {
          if (userDetails.authorities[0].authority == 'JUGADOR') {
            this.conexion.getUsuarioActual().subscribe(
              (user: any) => {
                if (user.emailVerified) {
                  this.conexion.setUser(userDetails);
                  localStorage.setItem('location', '0');
                  this.cdr.detectChanges();
                  this.presentAlert('Éxito', 'Inicio de sesión exitoso');
                  this.conexion.loginStatus.next(true);
                  this.route.navigate(['/tabs/tab3']);
                } else {
                  this.presentAlert('Fallido', 'No has verificado tu mail');
                  ("el alert del mail")
                }
              },
              (error) => {
                this.presentAlert('Fallido', 'Inicio de sesión fallido');
                this.conexion.loginStatus.next(false);
              }
            );
          } else {
            this.presentAlert('Fallido', 'Inicio de sesión fallido');
            this.conexion.loginStatus.next(false);
          }
        });
      },
      (error) => {
        this.presentAlert('Fallido', 'Inicio de sesión fallido');
        this.conexion.loginStatus.next(false);
      }
    );
  }

  /**
   * Pide el mail al usuario para recuperar su contraseña. Le envía un link para recuperar la pass.
   */
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
          text: 'Enviar',
          handler: (data) => {
            this.presentToast("Espera un momento por favor!");
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

  /**
   * Redirige al usuario a un componente donde se renderiza la entrada recuperada del blog
   * @param id id de la entrada del blog
   */
  verEntrada(id: string) {
    this.route.navigate(['/tabs/tab1/noticias', id]);
  }

  /**
   * Comodín para poner una alerta en el front
   * @param header Mensaje de cabecera
   * @param message Mensaje de cuerpo
   */
  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK'],
    });

    await alert.present();
  }

  /**
   * Comodín para poner un toast en el front
   * @param mensaje Mensaje de cuerpo
   */
  async presentToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'top',
      color: 'primary'
    });
    toast.present();
  }


}

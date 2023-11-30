import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { LoadingController } from '@ionic/angular';

import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { Usuario } from 'src/app/objetos/usuario';
import { ConexionService } from 'src/app/services/conexion.service';


@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage {
  contactForm!: FormGroup;
  user: Usuario = new Usuario();

  constructor(private alertController: AlertController, private conexion: ConexionService,
    private readonly fb: FormBuilder, private activatedRoute: ActivatedRoute,
    private route: Router, private toastController: ToastController, private loadingController: LoadingController) {
    this.contactForm = fb.group({
      formularioUsernameUsuario: ['', [Validators.required, Validators.minLength(5)]],
      formularioPasswordUsuario: ['', [Validators.required, Validators.minLength(6), PasswordStrengthValidator()]],
      formularioEmailUsuario: ['', [Validators.required, Validators.minLength(6), Validators.email]],
      formularioNombreUsuario: ['', [Validators.required, Validators.minLength(3)]],
      formularioApellidoUsuario: ['', [Validators.required, Validators.minLength(3)]],
    });

  }

  /**
   * Toma los valores ingresados de los inputs del formulario de registro y consume un metodo POST del API para registrar al usuario
   */
  // registrarse() {
  //   this.presentToast("Espere un momento por favor!");


  //   this.conexion.postUsuario(this.user).subscribe(
  //     (dato) => {
  //       this.presentAlert('Registro exitoso', 'Verificá tu mail para confirmar la cuenta!');
  //       this.route.navigate(['/tabs/tab1']);
  //     },
  //     (error) => {
  //       if (error.status === 409) { // Chequea si ya existe el username registrado
  //         this.presentAlert('Usuario existente', error.error.mensaje);
  //       } else {
  //         this.presentAlert('No se ha podido registrar', 'Contactanos para ver porqué no pudiste registrarte');
  //       }
  //       console.log("Qué estás buscando, picaron? " + error.message);
  //     }
  //   );

  // }

  async registrarse() {
    const loading = await this.loadingController.create({
      message: 'Espere un momento por favor...',
      backdropDismiss: false
    });
    await loading.present();


    this.user.username = this.contactForm.value.formularioUsernameUsuario;
    this.user.password = this.contactForm.value.formularioPasswordUsuario;
    this.user.email = this.contactForm.value.formularioEmailUsuario;
    this.user.nombre = this.contactForm.value.formularioNombreUsuario;
    this.user.apellido = this.contactForm.value.formularioApellidoUsuario;


    this.conexion.postUsuario(this.user).subscribe(
      async (dato) => {
        await loading.dismiss(); // Cierra el loader
        this.presentAlert('Registro exitoso', 'Verificá tu mail para confirmar la cuenta!');
        this.route.navigate(['/tabs/tab1']);
      },
      async (error) => {
        if (error.status === 409) { // Chequea si ya existe el username registrado
          this.presentAlert('Usuario existente', error.error.mensaje);
        } else {
          this.presentAlert('No se ha podido registrar', 'Contactanos para ver porqué no pudiste registrarte');
        }
        console.log("Qué estás buscando, picaron? " + error.message);
        await loading.dismiss();
      }
    );
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

/**
 * A través de una expresión regular chequea si la pass tiene al menos una mayúscula y un número y 6 chars
 * @returns boolean o null
 */
export function PasswordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} | null => {
    let password = control.value;
    let regExp = /^(?=.*?[A-Z])(?=.*?[0-9]).{6,}$/;
    if (password && !regExp.test(password)) {
      return { 'passwordStrength': true };
    }
    return null;
  };
}





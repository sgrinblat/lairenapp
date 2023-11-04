import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
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
    private route: Router, private toastController: ToastController) {
    this.contactForm = fb.group({
      formularioUsernameUsuario: ['', [Validators.required, Validators.minLength(5)]],
      formularioPasswordUsuario: ['', [Validators.required, Validators.minLength(6), PasswordStrengthValidator()]],
      formularioEmailUsuario: ['', [Validators.required, Validators.minLength(6), Validators.email]],
      formularioNombreUsuario: ['', [Validators.required, Validators.minLength(3)]],
      formularioApellidoUsuario: ['', [Validators.required, Validators.minLength(3)]],
    });

  }

  registrarse() {
    this.presentToast("Espere un momento por favor!");
    this.user.username = this.contactForm.value.formularioUsernameUsuario;
    this.user.password = this.contactForm.value.formularioPasswordUsuario;
    this.user.email = this.contactForm.value.formularioEmailUsuario;
    this.user.nombre = this.contactForm.value.formularioNombreUsuario;
    this.user.apellido = this.contactForm.value.formularioApellidoUsuario;

    this.conexion.postUsuario(this.user).subscribe(
      (dato) => {
        this.presentAlert('Registro exitoso', 'Verificá tu mail para confirmar la cuenta!');
        this.route.navigate(['/tabs/tab1']);
      },
      (error) => {
        if (error.status === 409) { // Conflict status
          this.presentAlert('Usuario existente', error.error.mensaje);
        } else {
          this.presentAlert('No se ha podido registrar', 'Contactanos para ver porqué no pudiste registrarte');
        }
        console.log("Qué estás buscando, picaron? " + error.message);
      }
    );

  }

  reiniciarForm() {
    this.contactForm.value.formularioUsernameUsuario = "";
    this.contactForm.value.formularioPasswordUsuario = "";
    this.contactForm.value.formularioEmailUsuario = "";
    this.contactForm.value.formularioNombreUsuario = "";
    this.contactForm.value.formularioApellidoUsuario = "";
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK'],
    });

    await alert.present();
  }

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





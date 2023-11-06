import { Component } from '@angular/core';
import { KeepAwake } from '@capacitor-community/keep-awake';

@Component({
  selector: 'app-life-counter',
  templateUrl: './life-counter.page.html',
  styleUrls: ['./life-counter.page.scss'],
})
export class LifeCounterPage {
  player1Life: number = 20;
  player2Life: number = 20;
  player1ChangeCounter: number = 0;
  player2ChangeCounter: number = 0;
  displayPlayer1Counter: boolean = false;
  displayPlayer2Counter: boolean = false;
  player1Timeout: any = null;
  player2Timeout: any = null;

  /**
   * Actualiza la cantidad de vida del jugador para renderizar en pantalla
   * @param amount cantidad de vida a cambiar
   * @param player jugador 1 o 2
   */
  changeLifeCount(amount: number, player: string) {
    if (player === 'player1') {
      this.player1Life += amount;
      this.updateChangeCounter(amount, 'player1');
    } else {
      this.player2Life += amount;
      this.updateChangeCounter(amount, 'player2');
    }
  }

  /**
   * Actualiza la cantidad de vida del jugador para renderizar en pantalla
   * @param amount cantidad de vida a cambiar
   * @param player jugador 1 o 2
   */
  updateChangeCounter(amount: number, player: string) {
    if (player === 'player1') {
      clearTimeout(this.player1Timeout); // Clear previous timeout
      this.player1ChangeCounter += amount;
      this.displayPlayer1Counter = true;
      this.player1Timeout = setTimeout(() => {
        this.player1ChangeCounter = 0;
        this.displayPlayer1Counter = false;
      }, 2000);
    } else {
      clearTimeout(this.player2Timeout); // Clear previous timeout
      this.player2ChangeCounter += amount;
      this.displayPlayer2Counter = true;
      this.player2Timeout = setTimeout(() => {
        this.player2ChangeCounter = 0;
        this.displayPlayer2Counter = false;
      }, 2000);
    }
  }

  /**
   * Regresa la vida a 20 para ambos jugadores
   */
  resetLife() {
    this.player1Life = 20;
    this.player2Life = 20;
  }

  /**
   * Al ingresar a este componente, esto provoca que la pantalla no pueda apagarse por la config de energia del aparato
   */
  ionViewWillEnter(): void {
    KeepAwake.keepAwake().then(() => {
      console.log('La pantalla se mantendrá encendida');
    }).catch((error) => {
      console.error('Error al intentar mantener la pantalla encendida', error);
    });
  }

  /**
   * Permite que pueda volver a apagarse la pantalla
   */
  ionViewWillLeave(): void {
    KeepAwake.allowSleep().then(() => {
      console.log('La pantalla puede apagarse');
    }).catch((error) => {
      console.error('Error al intentar permitir que la pantalla se apague', error);
    });
  }

}

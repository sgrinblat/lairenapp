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

  changeLifeCount(amount: number, player: string) {
    if (player === 'player1') {
      this.player1Life += amount;
      this.updateChangeCounter(amount, 'player1');
    } else {
      this.player2Life += amount;
      this.updateChangeCounter(amount, 'player2');
    }
  }

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

  resetLife() {
    this.player1Life = 20;
    this.player2Life = 20;
  }

  ionViewWillEnter(): void {
    // Activa la función para mantener la pantalla encendida
    KeepAwake.keepAwake().then(() => {
      console.log('La pantalla se mantendrá encendida');
    }).catch((error) => {
      console.error('Error al intentar mantener la pantalla encendida', error);
    });
  }

  ionViewWillLeave(): void {
    // Permite que la pantalla se apague cuando el componente se destruya
    KeepAwake.allowSleep().then(() => {
      console.log('La pantalla puede apagarse');
    }).catch((error) => {
      console.error('Error al intentar permitir que la pantalla se apague', error);
    });
  }

}

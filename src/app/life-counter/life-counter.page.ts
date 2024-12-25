import { Component } from '@angular/core';
import { KeepAwake } from '@capacitor-community/keep-awake';
import { AlertController, ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular'; // Importar Ionic Storage

@Component({
  selector: 'app-life-counter',
  templateUrl: './life-counter.page.html',
  styleUrls: ['./life-counter.page.scss'],
})
export class LifeCounterPage {
  // Colores predefinidos
  predefinedColors: string[] = ['#ff6347', '#4682b4', '#32cd32', '#ffd700', '#9370db'];

  // Colores seleccionados por el usuario
  player1Color: string = '#181818';
  player2Color: string = '#d77d07';
  player1ItemColor: string = '#5a5a5a';
  player2ItemColor: string = '#d77d07';

  player1Life: number = 20;
  player2Life: number = 20;
  player1ChangeCounter: number = 0;
  player2ChangeCounter: number = 0;
  displayPlayer1Counter: boolean = false;
  displayPlayer2Counter: boolean = false;
  player1Timeout: any = null;
  player2Timeout: any = null;
  player1History: string[] = [];
  player2History: string[] = [];
  displayHistory: boolean = false;

  private audioContext: AudioContext = new AudioContext();

  constructor(private alertController: AlertController, private modalController: ModalController, private storage: Storage) {
    this.initStorage();
  }


  // Inicializar el almacenamiento
  async initStorage() {
    await this.storage.create();
    await this.loadGameState(); // Cargar el estado guardado al iniciar la aplicación
  }

  // Cargar el estado guardado de vidas y del historial
  async loadGameState() {
    const player1Life = await this.storage.get('player1Life');
    const player2Life = await this.storage.get('player2Life');
    const player1History = await this.storage.get('player1History');
    const player2History = await this.storage.get('player2History');

    if (player1Life !== null) this.player1Life = player1Life;
    if (player2Life !== null) this.player2Life = player2Life;
    if (player1History !== null) this.player1History = player1History;
    if (player2History !== null) this.player2History = player2History;
  }

  // Guardar el estado actual en almacenamiento
  async saveGameState() {
    await this.storage.set('player1Life', this.player1Life);
    await this.storage.set('player2Life', this.player2Life);
    await this.storage.set('player1History', this.player1History);
    await this.storage.set('player2History', this.player2History);
  }

  changeLifeCount(amount: number, player: string) {
    if (player === 'player1') {
      this.reproducirSonido();
      this.player1Life += amount;
      this.updateChangeCounter(amount, 'player1');
      this.addToHistory(amount, this.player1Life, 'player1');
    } else {
      this.reproducirSonido();
      this.player2Life += amount;
      this.updateChangeCounter(amount, 'player2');
      this.addToHistory(amount, this.player2Life, 'player2');
    }
    this.saveGameState(); // Guardar el estado después de cada cambio
  }

  updateChangeCounter(amount: number, player: string) {
    if (player === 'player1') {
      clearTimeout(this.player1Timeout);
      this.player1ChangeCounter += amount;
      this.displayPlayer1Counter = true;
      this.player1Timeout = setTimeout(() => {
        this.player1ChangeCounter = 0;
        this.displayPlayer1Counter = false;
      }, 2000);
    } else {
      clearTimeout(this.player2Timeout);
      this.player2ChangeCounter += amount;
      this.displayPlayer2Counter = true;
      this.player2Timeout = setTimeout(() => {
        this.player2ChangeCounter = 0;
        this.displayPlayer2Counter = false;
      }, 2000);
    }
  }


  addToHistory(amount: number, newLife: number, player: string) {
    const changeText = `${amount > 0 ? '+' : ''}${amount} = ${newLife}`;
    if (player === 'player1') {
      this.player1History.push(changeText);
      this.player2History.push(''); // Añadir un registro vacío para el jugador 2
    } else {
      this.player2History.push(changeText);
      this.player1History.push(''); // Añadir un registro vacío para el jugador 1
    }
  }

  async resetLife() {
    const alert = await this.alertController.create({
      header: 'Reiniciar Vida',
      buttons: [
        {
          text: 'Reiniciar a 20 vidas',
          handler: () => {
            this.setLife(20);
          },
        },
        {
          text: 'Reiniciar a 40 vidas',
          handler: () => {
            this.setLife(40);
          },
        },
      ],
    });

    await alert.present();
  }

  setLife(life: number) {
    this.player1Life = life;
    this.player2Life = life;
    this.player1History = [];
    this.player2History = [];
    this.saveGameState(); // Guardar el estado después del reinicio
  }

  toggleHistory() {
    this.displayHistory = !this.displayHistory;
  }

  /**
   * Al ingresar a este componente, esto provoca que la pantalla no pueda apagarse por la config de energia del aparato
   */
  ionViewWillEnter(): void {
    KeepAwake.keepAwake()
      .then(() => {
        console.log('La pantalla se mantendrá encendida');
      })
      .catch((error) => {
        console.error(
          'Error al intentar mantener la pantalla encendida',
          error
        );
      });
  }

  /**
   * Permite que pueda volver a apagarse la pantalla
   */
  ionViewWillLeave(): void {
    KeepAwake.allowSleep()
      .then(() => {
        console.log('La pantalla puede apagarse');
      })
      .catch((error) => {
        console.error(
          'Error al intentar permitir que la pantalla se apague',
          error
        );
      });
  }

  /**
   * Reproduce un sonido pasado por parámetro
   * @param url ruta del sonido
   */
  async playSound(url: string) {
    // Fetch the audio file data from the URL
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();

    // Decode the audio data
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

    // Create an audio source
    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;

    // Connect the source to the context's destination
    source.connect(this.audioContext.destination);

    // Play the audio
    source.start();
  }

  /**
   * Busca un sonido en los assets para reproducirlo
   */
  reproducirSonido() {
    // URL of the sound you want to play
    const soundUrl = '../../assets/click.mp3';
    this.playSound(soundUrl);
  }
}

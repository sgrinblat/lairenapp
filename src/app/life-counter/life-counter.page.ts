import { Component } from '@angular/core';
import { KeepAwake } from '@capacitor-community/keep-awake';
import { AlertController, ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

type Player = 'player1' | 'player2';

@Component({
  selector: 'app-life-counter',
  templateUrl: './life-counter.page.html',
  styleUrls: ['./life-counter.page.scss'],
})
export class LifeCounterPage {
  // Colores predefinidos
  predefinedColors: string[] = ['#ff6347', '#4682b4', '#32cd32', '#ffd700', '#9370db', '#00ced1', '#d77d07', '#181818'];

  // Colores seleccionados por el usuario
  player1Color: string;
  player2Color: string;
  player1ItemColor: string;
  player2ItemColor: string;

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

  // --- Estado para hold/long-press ---
  private holdMap: Record<string, { t?: any; interval?: any; fired: boolean; pressing: boolean }> = {};

  // Índices para controlar el color actual de cada jugador
  private player1ColorIndex: number = 0;
  private player2ColorIndex: number = 0;

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
    const player1Color = await this.storage.get('player1Color');
    const player2Color = await this.storage.get('player2Color');

    if (player1Color) {
      this.player1Color = player1Color;
      this.player1ItemColor = player1Color;
    }
    if (player2Color) {
      this.player2Color = player2Color;
      this.player2ItemColor = player2Color;
    }

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
    await this.storage.set('player1Color', this.player1Color);
    await this.storage.set('player2Color', this.player2Color);
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

  updateChangeCounter(amount: number, player: Player) {
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

  addToHistory(amount: number, newLife: number, player: Player) {
    const now = new Date();
    const timestamp = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}:${now.getMilliseconds()}`;
    const changeText = `${amount > 0 ? '+' : ''}${amount} = ${newLife} (a las ${timestamp})`;

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

  // Método para cambiar el color de fondo
  cycleBackgroundColor(player: Player) {
    if (player === 'player1') {
      this.player1ColorIndex = (this.player1ColorIndex + 1) % this.predefinedColors.length;
      this.player1Color = this.predefinedColors[this.player1ColorIndex];
      this.player1ItemColor = this.predefinedColors[this.player1ColorIndex];
    } else if (player === 'player2') {
      this.player2ColorIndex = (this.player2ColorIndex + 1) % this.predefinedColors.length;
      this.player2Color = this.predefinedColors[this.player2ColorIndex];
      this.player2ItemColor = this.predefinedColors[this.player2ColorIndex];
    }
    this.saveGameState(); // Guardar el estado del color seleccionado
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
        console.error('Error al intentar mantener la pantalla encendida', error);
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
        console.error('Error al intentar permitir que la pantalla se apague', error);
      });
  }

  /**
   * Reproduce un sonido pasado por parámetro
   * @param url ruta del sonido
   */
  async playSound(url: string) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioContext.destination);
    source.start();
  }

  /**
   * Busca un sonido en los assets para reproducirlo
   */
  reproducirSonido() {
    const soundUrl = '../../assets/click.mp3';
    this.playSound(soundUrl);
  }

  // ---------- Hold / Long-Press con repetición y color dinámico ----------

  private keyFor(player: Player, amount: number) {
    // amount puede ser +1 o -1
    return `${player}_${amount > 0 ? 'inc' : 'dec'}`;
  }

  // Para colorear el botón durante el hold
  isHolding(player: Player, amount: number): boolean {
    const k = this.keyFor(player, amount);
    return !!this.holdMap[k]?.pressing;
  }

  // Vibraciones suaves (si Haptics está disponible)
  private async hapticImpact() {
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch {}
  }
  private async hapticNotify() {
    try { await Haptics.notification({ type: NotificationType.Success }); } catch {}
  }

  onHoldStart(player: Player, amount: number) {
    const key = this.keyFor(player, amount);
    // Cancelar si había algo previo
    this.onHoldCancel(player, amount);

    this.holdMap[key] = { fired: false, pressing: true };

    // A los 3s: aplica ±10 y comienza repetición cada 1s mientras siga presionando
    this.holdMap[key].t = setTimeout(async () => {
      const entry = this.holdMap[key];
      if (!entry || !entry.pressing) return;

      entry.fired = true;
      await this.hapticNotify(); // vibración por long-press logrado
      this.changeLifeCount(amount * 10, player);

      // Repetición cada 1s mientras mantenga presionado
      entry.interval = setInterval(async () => {
        const e = this.holdMap[key];
        if (!e || !e.pressing) { clearInterval(entry.interval); return; }
        await this.hapticImpact(); // vibración leve por tick
        this.changeLifeCount(amount * 10, player);
      }, 500);
    }, 700);
  }

  onHoldEnd(player: Player, amount: number) {
    const key = this.keyFor(player, amount);
    const entry = this.holdMap[key];
    if (!entry) return;

    entry.pressing = false;
    clearTimeout(entry.t);
    if (entry.interval) clearInterval(entry.interval);

    // Si NO llegó al long-press (no fired), esto es tap corto => ±1
    if (!entry.fired) {
      this.changeLifeCount(amount, player);
    }

    delete this.holdMap[key];
  }

  onHoldCancel(player: Player, amount: number) {
    const key = this.keyFor(player, amount);
    const entry = this.holdMap[key];
    if (!entry) return;

    entry.pressing = false;
    clearTimeout(entry.t);
    if (entry.interval) clearInterval(entry.interval);
    delete this.holdMap[key];
  }
}

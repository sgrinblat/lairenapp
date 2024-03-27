import { Component } from "@angular/core";
import { ModalController } from "@ionic/angular";

@Component({
  selector: 'app-select-subtypes-modal',
  templateUrl: './select-subtypes-modal.component.html',
  styleUrls: ['./select-subtypes-modal.component.scss'],
})
export class SelectSubtypesModalComponent {
  nombresSubtipoUnicos = []; // Asegúrate de inicializar esta variable con tus opciones
  selectedSubtype1: string;
  selectedSubtype2: string;

  constructor(private modalCtrl: ModalController) {}

  confirmSelection() {
    this.modalCtrl.dismiss({
      selectedSubtype1: this.selectedSubtype1,
      selectedSubtype2: this.selectedSubtype2
    });
  }
}

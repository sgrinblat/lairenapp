import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { IonTabs, AnimationController, Animation } from '@ionic/angular';
import { createGesture } from '@ionic/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements AfterViewInit {
  @ViewChild(IonTabs, { static: true }) tabs!: IonTabs;
  @ViewChild(IonTabs, { read: ElementRef, static: true }) tabsEl!: ElementRef<HTMLElement>;

  // Orden real de tus tabs (coincide con los "tab" de cada <ion-tab-button>)
  readonly tabsOrder = ['tab1', 'tab2', 'tab3', 'life-counter', 'calendar'] as const;

  // current puede ser cualquiera de los ids de tabsOrder
  private current: (typeof this.tabsOrder)[number] = this.tabsOrder[0];

  // flags para animaciones y para evitar reentradas
  private isTransitioning = false;
  private suppressNextTabChange = false;

  constructor(
    private router: Router,
    private animCtrl: AnimationController
  ) {}

  ngAfterViewInit() {
    // Set inicial por si la URL ya está en un tab intermedio
    this.current = (this.tabs.getSelected() as any) ?? this.tabsOrder[0];

    const gesture = createGesture({
      el: this.tabsEl.nativeElement,
      gestureName: 'tabs-swipe',
      direction: 'x',
      canStart: (detail) => {
        if (this.isTransitioning) return false;
        const x = detail.startX, w = window.innerWidth;
        // Evitar conflicto con el gesto "atrás"/"home" desde los bordes
        return x >= 24 && x <= (w - 24);
      },
      threshold: 10,
      onEnd: (ev) => {
        const { deltaX, velocityX } = ev;
        const passedDistance = Math.abs(deltaX) > 60;
        const fastEnough = Math.abs(velocityX) > 0.2;

        if (passedDistance || fastEnough) {
          if (deltaX < 0) this.goNextTabAnimated(); // swipe ← => siguiente
          else this.goPrevTabAnimated();            // swipe → => anterior
        }
      },
    });

    gesture.enable(true);
  }

  // Se dispara al tocar la tab bar o al cambiar el tab de otra forma
  onTabChange(event: any) {
    // Ignorar si el cambio fue programático durante la animación
    if (this.suppressNextTabChange || this.isTransitioning) {
      this.suppressNextTabChange = false;
      return;
    }

    const path = event.tab as (typeof this.tabsOrder)[number];
    const currIdx = this.tabsOrder.indexOf(this.current);
    const nextIdx = this.tabsOrder.indexOf(path);

    if (nextIdx === -1 || currIdx === -1 || nextIdx === currIdx) {
      this.current = path;
      this.router.navigate([`/tabs/${path}`]);
      return;
    }

    const dir: 'left' | 'right' = nextIdx > currIdx ? 'left' : 'right';
    this.animateTabChange(path, dir);
  }

  private async goNextTabAnimated() {
    const i = this.tabsOrder.indexOf(this.current);
    if (i < this.tabsOrder.length - 1) {
      const next = this.tabsOrder[i + 1];
      await this.animateTabChange(next, 'left');
    }
  }

  private async goPrevTabAnimated() {
    const i = this.tabsOrder.indexOf(this.current);
    if (i > 0) {
      const prev = this.tabsOrder[i - 1];
      await this.animateTabChange(prev, 'right');
    }
  }

  /** Anima salida de la página actual y entrada de la nueva */
  private async animateTabChange(
    nextTabId: (typeof this.tabsOrder)[number],
    dir: 'left' | 'right'
  ) {
    if (this.isTransitioning) return;

    this.isTransitioning = true;
    try {
      const currentPage = this.getActivePageEl();
      if (currentPage) {
        const outX = dir === 'left' ? -20 : 20; // px
        await this.playOnce(
          this.animCtrl.create()
            .addElement(currentPage)
            .duration(140)
            .easing('cubic-bezier(0.22, 0.61, 0.36, 1)')
            .fromTo('opacity', '1', '0.25')
            .fromTo('transform', 'translateX(0px)', `translateX(${outX}px)`)
        );
      }

      // Evitar que onTabChange re-animé el cambio programático
      this.suppressNextTabChange = true;
      await this.tabs.select(nextTabId);

      this.current = nextTabId;
      this.router.navigate([`/tabs/${nextTabId}`]);

      // Animación de entrada del nuevo tab
      const nextPage = this.getActivePageEl();
      if (nextPage) {
        const inX = dir === 'left' ? 20 : -20;
        nextPage.style.opacity = '0';
        nextPage.style.transform = `translateX(${inX}px)`;

        await this.playOnce(
          this.animCtrl.create()
            .addElement(nextPage)
            .duration(180)
            .easing('cubic-bezier(0.22, 0.61, 0.36, 1)')
            .fromTo('opacity', '0', '1')
            .fromTo('transform', `translateX(${inX}px)`, 'translateX(0px)')

        );

        // limpiar estilos inline
        nextPage.style.removeProperty('transform');
        nextPage.style.removeProperty('opacity');
      }
    } finally {
      this.isTransitioning = false;
      // suppressNextTabChange se resetea en onTabChange al próximo evento
    }
  }

  /** Localiza la ion-page visible del tab activo */
  private getActivePageEl(): HTMLElement | null {
    const root = this.tabsEl.nativeElement;
    // Intentá primero dentro del router-outlet de tabs
    return root.querySelector<HTMLElement>('ion-router-outlet > .ion-page:not(.ion-page-hidden)')
        ?? root.querySelector<HTMLElement>('.ion-page:not(.ion-page-hidden)');
  }

  private playOnce(animation: Animation): Promise<void> {
    // Si no hay elementos a animar, resolvé al toque
    const elements = (animation as any).elements as Element[] | undefined;
    if (!elements || elements.length === 0) return Promise.resolve();

    return new Promise<void>((resolve) => {
      animation.onFinish(() => resolve(), { oneTimeCallback: true }).play();
    });
  }
}

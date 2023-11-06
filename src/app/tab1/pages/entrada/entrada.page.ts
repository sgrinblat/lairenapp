import { Component, ElementRef, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ContentfulService } from 'src/app/services/contentful.service';


@Component({
  selector: 'app-entrada',
  templateUrl: './entrada.page.html',
  styleUrls: ['./entrada.page.scss'],
})
export class EntradaPage implements OnInit {

  blogPost$: Observable<any>;


  constructor(private elementRef: ElementRef,
    private contentfulService: ContentfulService,
    private router: Router,
    private route: ActivatedRoute,) { }

  /**
   * Toma el id de la entrada de la url y consume el API de Contentful para renderizar su información
   */
  ngOnInit() {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      this.blogPost$ = this.contentfulService.getEntryById(id).pipe(
        tap(() => {
          setTimeout(() => this.modifyImageStyles(), 0);
        })
      );
    });
  }

  /**
   * Recupera las imágenes de la entrada del blog y le aplica estilos responsivos
   */
  modifyImageStyles() {
    const images = this.elementRef.nativeElement.querySelectorAll('img');
    for (let i = 1; i < images.length; i++) {
      images[i].style.height = 'auto';
      images[i].style.width = '100%';
      images[i].style.maxWidth = '650px';
      images[i].style.margin = 'auto';
      images[i].style.display = 'block';
      images[i].style.marginTop = '30px';
      images[i].style.marginBottom = '90px';
    }
  }

}

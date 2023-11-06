import { Injectable } from '@angular/core';
import { createClient, Entry } from 'contentful';
import { from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContentfulService {

  constructor() { }

  private client = createClient({
    space: "6j9ng6ddn64j",
    accessToken: "IGv5hBAOWPYsHXHxobo_4kL0XOurB5wUiBHwulmoR6w"
  });


  /**
   * Recupera una entrada espeficia por id en el API de Contentful
   * @param id id de la entrada
   * @returns
   */
  getEntryById(id:string) {
    const promise = this.client.getEntry(id);
    return from(promise);
  }

  /**
   * Recupera entradas según la categoría
   * @param categoryName categoría de entradas a buscar
   * @returns
   */
  getBlogEntriesByCategory(categoryName: string) {
    return this.client.getEntries({
      content_type: 'blogPost',
      'fields.category': categoryName,
      order: '-sys.createdAt'
    } as any)
    .then(response => response.items);
  }


}

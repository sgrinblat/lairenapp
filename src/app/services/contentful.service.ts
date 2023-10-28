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

  getAllEntries () {
    const promise = this.client.getEntries();
    return from(promise);
  }

  getEntryById(id:string) {
    const promise = this.client.getEntry(id);
    return from(promise);
  }

  getEntryByUrlHandle(urlHande: string) {
    return this.client.getEntries({
      content_type: 'blogPost',
      'fields.urlHandle': urlHande
    })
    .then(response => response.items);
  }

  getBlogEntriesByCategory(categoryName: string) {
    return this.client.getEntries({
      content_type: 'blogPost',
      'fields.category': categoryName,
      order: '-sys.createdAt'
    } as any)
    .then(response => response.items);
  }


  getBlogEntriesByCategoryAndOnlyThree(categoryName: string) {
    return this.client.getEntries({
      content_type: 'blogPost',
      'fields.category': categoryName,
      limit: 3,
      order: '-sys.createdAt'
    } as any )
    .then(response => response.items);
  }

  getBlogEntriesByCategoryAndOnlyOne(categoryName: string) {
    return this.client.getEntries({
      content_type: 'blogPost',
      'fields.category': categoryName,
      limit: 1,
      order: '-sys.createdAt'
    } as any )
    .then(response => response.items);
  }

}

import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  constructor(private router: Router) {}

  onTabChange(event: any) {
    const path = event.tab;
    this.router.navigate([`/tabs/${path}`]);
  }
}

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  constructor(private router: Router) {}

  navigateWithReload(route: string) {
    // First navigate away using skipLocationChange
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      // Then navigate to the desired route
      this.router.navigate([route]);
    });
  }
}

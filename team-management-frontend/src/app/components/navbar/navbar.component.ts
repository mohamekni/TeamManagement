import { Component, HostListener, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isScrolled = false;
  currentRoute = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Suivre les changements de route pour mettre à jour currentRoute
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.url;
      console.log('Route actuelle:', this.currentRoute);
    });
  }

  // Détecter le défilement pour changer l'apparence de la navbar
  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;

    // Ajouter ou supprimer une classe au navbar en fonction du défilement
    const navbar = document.getElementById('mainNav');
    if (navbar) {
      if (this.isScrolled) {
        navbar.classList.add('navbar-scrolled');
      } else {
        navbar.classList.remove('navbar-scrolled');
      }
    }
  }

  // Méthode pour simuler une déconnexion (à implémenter plus tard)
  logout(): void {
    console.log('Déconnexion...');
    // Logique de déconnexion à implémenter
    alert('Fonctionnalité de déconnexion à implémenter');
  }
}

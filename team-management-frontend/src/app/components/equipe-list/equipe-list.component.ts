import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EquipeService } from 'src/app/services/equipe.service';
import { Equipe } from 'src/app/models/equipe.model';

@Component({
  selector: 'app-equipe-list',
  templateUrl: './equipe-list.component.html',
  styleUrls: ['./equipe-list.component.css']
})
export class EquipeListComponent implements OnInit {
  equipes: Equipe[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private equipeService: EquipeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEquipes();
  }

  loadEquipes(): void {
    this.loading = true;
    this.error = null;

    this.equipeService.getEquipes().subscribe(
      (data) => {
        console.log('Équipes chargées:', data);
        this.equipes = data;
        this.loading = false;
      },
      (error) => {
        console.error('Erreur lors du chargement des équipes:', error);
        this.error = 'Impossible de charger les équipes. Veuillez réessayer plus tard.';
        this.loading = false;
      }
    );
  }

  navigateToAddEquipe(): void {
    this.router.navigate(['/equipes/ajouter']);
  }

  navigateToEditEquipe(id: string): void {
    this.router.navigate(['/equipes/modifier', id]);
  }

  navigateToEquipeDetail(id: string): void {
    this.router.navigate(['/equipes/detail', id]);
  }

  deleteEquipe(id: string): void {
    if (!id) {
      console.error('ID est indéfini');
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir supprimer cette équipe?')) {
      this.equipeService.deleteEquipe(id).subscribe(
        () => {
          console.log('Équipe supprimée avec succès');
          this.loadEquipes();
        },
        (error) => {
          console.error('Erreur lors de la suppression de l\'équipe:', error);
          this.error = 'Impossible de supprimer l\'équipe. Veuillez réessayer plus tard.';
        }
      );
    }
  }
}

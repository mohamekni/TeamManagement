import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EquipeService } from 'src/app/services/equipe.service';
import { UserService } from 'src/app/services/user.service';
import { Equipe } from 'src/app/models/equipe.model';
import { Membre } from 'src/app/models/membre.model';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-equipe-detail',
  templateUrl: './equipe-detail.component.html',
  styleUrls: ['./equipe-detail.component.css']
})
export class EquipeDetailComponent implements OnInit {
  equipe: Equipe | null = null;
  loading = false;
  error: string | null = null;
  equipeId: string | null = null;
  newMembre: any = { id: '' };
  availableUsers: User[] = [];
  memberNames: { [key: string]: string } = {}; // Map pour stocker les noms des membres

  constructor(
    private equipeService: EquipeService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.equipeId = this.route.snapshot.paramMap.get('id');

    // Charger tous les utilisateurs disponibles
    this.loadUsers();

    if (this.equipeId) {
      this.loadEquipe(this.equipeId);
    } else {
      this.error = 'ID d\'équipe non spécifié';
    }
  }

  // Méthode pour charger tous les utilisateurs
  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.availableUsers = users;
        console.log('Utilisateurs chargés:', users);

        // Si l'équipe est déjà chargée, mettre à jour les noms des membres
        if (this.equipe && this.equipe.members) {
          this.updateMemberNames();
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
      }
    });
  }

  // Méthode pour mettre à jour les noms des membres
  updateMemberNames(): void {
    if (!this.equipe || !this.equipe.members) return;

    this.equipe.members.forEach(membreId => {
      const user = this.availableUsers.find(u => u._id === membreId || u.id === membreId);
      if (user && user.name) {
        this.memberNames[membreId] = user.name;
      } else {
        // Si l'utilisateur n'est pas trouvé dans la liste, essayer de le récupérer individuellement
        this.userService.getUser(membreId).subscribe({
          next: (userData) => {
            if (userData && userData.name) {
              this.memberNames[membreId] = userData.name;
            } else {
              this.memberNames[membreId] = membreId; // Fallback à l'ID
            }
          },
          error: () => {
            this.memberNames[membreId] = membreId; // Fallback à l'ID en cas d'erreur
          }
        });
      }
    });
  }

  // Méthode pour obtenir le nom d'un membre
  getMembreName(membreId: string): string {
    return this.memberNames[membreId] || membreId;
  }

  loadEquipe(id: string): void {
    this.loading = true;
    this.error = null;

    this.equipeService.getEquipe(id).subscribe({
      next: (data) => {
        console.log('Détails de l\'équipe chargés:', data);
        this.equipe = data;

        // Mettre à jour les noms des membres
        if (this.equipe && this.equipe.members && this.equipe.members.length > 0) {
          this.updateMemberNames();
        }

        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des détails de l\'équipe:', error);
        this.error = 'Impossible de charger les détails de l\'équipe. Veuillez réessayer plus tard.';
        this.loading = false;
      }
    });
  }

  navigateToEditEquipe(): void {
    if (this.equipeId) {
      this.router.navigate(['/equipes/modifier', this.equipeId]);
    }
  }

  navigateToEquipeList(): void {
    this.router.navigate(['/equipes/liste']);
  }

  addMembreToEquipe(): void {
    if (!this.equipeId || !this.newMembre.id) {
      console.error('ID d\'équipe ou ID de membre manquant');
      return;
    }

    const membre: Membre = { id: this.newMembre.id };

    this.equipeService.addMembreToEquipe(this.equipeId, membre).subscribe({
      next: () => {
        console.log('Membre ajouté avec succès');
        this.loadEquipe(this.equipeId!);
        this.newMembre = { id: '' };
      },
      error: (error) => {
        console.error('Erreur lors de l\'ajout du membre:', error);
        this.error = 'Impossible d\'ajouter le membre. Veuillez réessayer plus tard.';
      }
    });
  }

  removeMembreFromEquipe(membreId: string): void {
    if (!this.equipeId) {
      console.error('ID d\'équipe manquant');
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir retirer ce membre de l\'équipe?')) {
      this.equipeService.removeMembreFromEquipe(this.equipeId, membreId).subscribe({
        next: () => {
          console.log('Membre retiré avec succès');
          this.loadEquipe(this.equipeId!);
        },
        error: (error) => {
          console.error('Erreur lors du retrait du membre:', error);
          this.error = 'Impossible de retirer le membre. Veuillez réessayer plus tard.';
        }
      });
    }
  }

  deleteEquipe(): void {
    if (!this.equipeId) {
      console.error('ID d\'équipe manquant');
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir supprimer cette équipe? Cette action est irréversible.')) {
      this.equipeService.deleteEquipe(this.equipeId).subscribe({
        next: () => {
          console.log('Équipe supprimée avec succès');
          this.router.navigate(['/equipes/liste']);
        },
        error: (error) => {
          console.error('Erreur lors de la suppression de l\'équipe:', error);
          this.error = 'Impossible de supprimer l\'équipe. Veuillez réessayer plus tard.';
        }
      });
    }
  }
}



import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EquipeService } from '../../services/equipe.service';
import { MembreService } from '../../services/membre.service';
import { UserService } from '../../services/user.service';
import { NotificationService } from '../../services/notification.service';
import { Equipe } from '../../models/equipe.model';
import { Membre } from '../../models/membre.model';
import { User } from '../../models/user.model';
import { debounceTime, distinctUntilChanged, switchMap, catchError, of } from 'rxjs';

@Component({
  selector: 'app-equipe-form',
  templateUrl: './equipe-form.component.html',
  styles: [`
    .cursor-pointer {
      cursor: pointer;
    }
    summary:hover {
      text-decoration: underline;
    }
  `]
})
export class EquipeFormComponent implements OnInit {
  equipe: Equipe = {
    name: '',
    description: '',
    admin: '65f1e5b3a1d8f3c8c0f9e8d7' // ID temporaire
  };
  isEditMode = false;
  loading = false;
  submitting = false;
  error: string | null = null;
  equipeId: string | null = null;
  nameExists = false;
  checkingName = false;
  existingEquipes: Equipe[] = [];
  availableMembers: Membre[] = []; // Liste des membres disponibles
  availableUsers: User[] = []; // Liste des utilisateurs disponibles

  constructor(
    private equipeService: EquipeService,
    private membreService: MembreService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    console.log('EquipeFormComponent initialized');

    // Ensure equipe is always defined with admin
    if (!this.equipe) {
      this.equipe = {
        name: '',
        description: '',
        admin: '65f1e5b3a1d8f3c8c0f9e8d7' // ID temporaire
      };
    }

    // Charger toutes les équipes pour vérifier les noms existants
    this.loadAllEquipes();

    // Charger tous les membres disponibles
    this.loadAllMembers();

    // Charger tous les utilisateurs disponibles
    this.loadAllUsers();

    try {
      // Vérifier si nous sommes en mode édition (si un ID est présent dans l'URL)
      this.equipeId = this.route.snapshot.paramMap.get('id');
      this.isEditMode = !!this.equipeId;
      console.log('Edit mode:', this.isEditMode, 'ID:', this.equipeId);

      if (this.isEditMode && this.equipeId) {
        this.loadEquipe(this.equipeId);
      }
    } catch (error) {
      console.error('Error in ngOnInit:', error);
      this.error = 'Erreur d\'initialisation';
    }
  }

  loadAllMembers(): void {
    this.membreService.getMembres().subscribe({
      next: (membres) => {
        this.availableMembers = membres;
        console.log('Membres disponibles chargés:', membres);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des membres:', error);
        this.error = 'Impossible de charger la liste des membres. Veuillez réessayer plus tard.';
      }
    });
  }

  loadAllUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.availableUsers = users;
        console.log('Utilisateurs disponibles chargés:', users);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        this.error = 'Impossible de charger la liste des utilisateurs. Veuillez réessayer plus tard.';
      }
    });
  }

  loadAllEquipes(): void {
    this.equipeService.getEquipes().subscribe({
      next: (equipes) => {
        this.existingEquipes = equipes;
        console.log('Équipes existantes chargées:', equipes);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des équipes:', error);
      }
    });
  }

  loadEquipe(id: string): void {
    console.log('Loading equipe with ID:', id);
    this.loading = true;
    this.error = null;

    this.equipeService.getEquipe(id).subscribe({
      next: (data) => {
        console.log('Équipe chargée:', data);
        this.equipe = data;

        // Si l'équipe a des membres, récupérer les informations de chaque membre
        if (this.equipe.members && this.equipe.members.length > 0) {
          this.loadMembersDetails();
        }

        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'équipe:', error);
        this.error = 'Impossible de charger les détails de l\'équipe. Veuillez réessayer plus tard.';
        this.loading = false;
      }
    });
  }

  // Méthode pour récupérer les détails des membres de l'équipe
  loadMembersDetails(): void {
    if (!this.equipe.members || this.equipe.members.length === 0) {
      return;
    }

    // Pour chaque membre de l'équipe, essayer de trouver son nom dans la liste des utilisateurs
    this.equipe.members.forEach(membreId => {
      // Chercher d'abord dans la liste des utilisateurs
      const user = this.availableUsers.find(u => (u._id === membreId || u.id === membreId));
      if (user) {
        console.log(`Membre ${membreId} trouvé dans la liste des utilisateurs:`, user);
      } else {
        // Si non trouvé, essayer de récupérer l'utilisateur depuis l'API
        this.userService.getUser(membreId).subscribe({
          next: (userData) => {
            console.log(`Détails de l'utilisateur ${membreId} récupérés:`, userData);
            // Ajouter l'utilisateur à la liste des utilisateurs disponibles s'il n'y est pas déjà
            if (!this.availableUsers.some(u => (u._id === userData._id || u.id === userData.id))) {
              this.availableUsers.push(userData);
            }
          },
          error: (error) => {
            console.error(`Erreur lors de la récupération des détails de l'utilisateur ${membreId}:`, error);
          }
        });
      }
    });
  }

  checkNameExists(name: string): boolean {
    // En mode édition, ignorer l'équipe actuelle
    if (this.isEditMode && this.equipeId) {
      return this.existingEquipes.some(e => e.name === name && e._id !== this.equipeId);
    }
    // En mode création, vérifier tous les noms
    return this.existingEquipes.some(e => e.name === name);
  }

  updateName(value: string): void {
    console.log('Name updated:', value);
    this.equipe.name = value;

    // Vérifier si le nom existe déjà
    this.nameExists = this.checkNameExists(value);
    if (this.nameExists) {
      console.warn('Ce nom d\'équipe existe déjà');
    }
  }

  updateDescription(value: string): void {
    console.log('Description updated:', value);
    this.equipe.description = value;
  }

  onSubmit(): void {
    console.log('Form submitted with:', this.equipe);

    if (!this.equipe.name) {
      this.error = 'Le nom de l\'équipe est requis.';
      return;
    }

    // Vérifier si le nom existe déjà avant de soumettre
    if (this.checkNameExists(this.equipe.name)) {
      this.error = 'Une équipe avec ce nom existe déjà. Veuillez choisir un autre nom.';
      return;
    }

    this.submitting = true;
    this.error = null;

    // Créer une copie de l'objet équipe pour éviter les problèmes de référence
    const equipeToSave: Equipe = {
      name: this.equipe.name,
      description: this.equipe.description || '',
      admin: this.equipe.admin
    };

    // Ajouter l'ID si nous sommes en mode édition
    if (this.isEditMode && this.equipeId) {
      equipeToSave._id = this.equipeId;
    }

    console.log('Données à envoyer:', equipeToSave);

    if (this.isEditMode && this.equipeId) {
      // Mode édition
      this.equipeService.updateEquipe(this.equipeId, equipeToSave).subscribe({
        next: (response) => {
          console.log('Équipe mise à jour avec succès:', response);
          this.submitting = false;
          this.notificationService.showSuccess(`L'équipe "${response.name}" a été mise à jour avec succès.`);
          this.router.navigate(['/equipes/liste']);
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour de l\'équipe:', error);
          this.error = `Impossible de mettre à jour l'équipe: ${error.message}`;
          this.submitting = false;
          this.notificationService.showError(`Erreur: ${error.message}`);
        }
      });
    } else {
      // Mode ajout
      this.equipeService.addEquipe(equipeToSave).subscribe({
        next: (response) => {
          console.log('Équipe ajoutée avec succès:', response);
          this.submitting = false;
          this.notificationService.showSuccess(`L'équipe "${response.name}" a été créée avec succès.`);
          this.router.navigate(['/equipes/liste']);
        },
        error: (error) => {
          console.error('Erreur lors de l\'ajout de l\'équipe:', error);
          this.error = `Impossible d'ajouter l'équipe: ${error.message}`;
          this.submitting = false;
          this.notificationService.showError(`Erreur: ${error.message}`);
        }
      });
    }
  }

  cancel(): void {
    console.log('Form cancelled');
    this.router.navigate(['/equipes/liste']);
  }

  // Méthodes pour gérer les membres
  addMembreToEquipe(membreId: string): void {
    if (!this.equipeId || !membreId) {
      console.error('ID d\'équipe ou ID de membre manquant');
      this.error = 'ID d\'équipe ou ID de membre manquant';
      return;
    }

    // Vérifier si le membre est déjà dans l'équipe
    if (this.equipe.members && this.equipe.members.includes(membreId)) {
      this.notificationService.showError('Ce membre fait déjà partie de l\'équipe');
      return;
    }

    const membre: Membre = { id: membreId };
    this.loading = true;

    this.equipeService.addMembreToEquipe(this.equipeId, membre).subscribe({
      next: (response) => {
        console.log('Membre ajouté avec succès:', response);
        this.notificationService.showSuccess('Membre ajouté avec succès à l\'équipe');
        // Recharger l'équipe pour mettre à jour la liste des membres
        this.loadEquipe(this.equipeId!);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors de l\'ajout du membre:', error);
        this.error = 'Impossible d\'ajouter le membre. Veuillez réessayer plus tard.';
        this.notificationService.showError('Erreur lors de l\'ajout du membre: ' + error.message);
        this.loading = false;
      }
    });
  }

  // Méthode pour obtenir le nom d'un membre à partir de son ID
  getMembreName(membreId: string): string {
    // Chercher d'abord dans la liste des utilisateurs
    const user = this.availableUsers.find(u => (u._id === membreId || u.id === membreId));
    if (user && user.name) {
      return user.name;
    }

    // Chercher ensuite dans la liste des membres
    const membre = this.availableMembers.find(m => (m._id === membreId || m.id === membreId));
    if (membre && membre.name) {
      return membre.name;
    }

    // Si aucun nom n'est trouvé, retourner l'ID
    return membreId;
  }

  removeMembreFromEquipe(membreId: string): void {
    if (!this.equipeId) {
      console.error('ID d\'équipe manquant');
      this.error = 'ID d\'équipe manquant';
      return;
    }

    // Obtenir le nom du membre pour l'afficher dans le message de confirmation
    const membreName = this.getMembreName(membreId);

    if (confirm(`Êtes-vous sûr de vouloir retirer ${membreName} de l'équipe?`)) {
      this.loading = true;

      this.equipeService.removeMembreFromEquipe(this.equipeId, membreId).subscribe({
        next: (response) => {
          console.log('Membre retiré avec succès:', response);
          this.notificationService.showSuccess(`${membreName} a été retiré avec succès de l'équipe`);
          // Recharger l'équipe pour mettre à jour la liste des membres
          this.loadEquipe(this.equipeId!);
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors du retrait du membre:', error);
          this.error = 'Impossible de retirer le membre. Veuillez réessayer plus tard.';
          this.notificationService.showError('Erreur lors du retrait du membre: ' + error.message);
          this.loading = false;
        }
      });
    }
  }
}






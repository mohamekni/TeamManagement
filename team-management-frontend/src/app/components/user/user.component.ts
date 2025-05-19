import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  newUser: User = {
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    profession: 'etudiant',
    dateOfBirth: '2000-01-01' // Date par défaut
  };
  selectedUser: User | null = null;
  isEditing = false;
  loading = false;
  error: string | null = null;

  // Filtres
  searchTerm: string = '';
  professionFilter: string = '';

  // Validation
  maxDate: string = '2005-01-01'; // Date limite pour la date de naissance

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  // Méthode pour appliquer les filtres
  applyFilters(): void {
    this.filteredUsers = this.users.filter(user => {
      // Filtrer par terme de recherche
      const searchMatch = !this.searchTerm ||
        (user.firstName && user.firstName.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (user.lastName && user.lastName.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (user.name && user.name.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (user.id && user.id.toLowerCase().includes(this.searchTerm.toLowerCase()));

      // Filtrer par profession
      const professionMatch = !this.professionFilter ||
        user.profession === this.professionFilter ||
        user.role === this.professionFilter;

      return searchMatch && professionMatch;
    });
  }

  // Méthode pour effacer la recherche
  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  // Méthode pour réinitialiser tous les filtres
  resetFilters(): void {
    this.searchTerm = '';
    this.professionFilter = '';
    this.applyFilters();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (data) => {
        console.log('Users loaded:', data);
        this.users = data;
        // Appliquer les filtres actuels aux données chargées
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.error = 'Impossible de charger les utilisateurs. Veuillez réessayer plus tard.';
        this.loading = false;
      }
    });
  }

  // Méthode pour générer un ID unique
  generateUniqueId(): string {
    // Générer un ID basé sur le prénom, le nom et un timestamp
    const timestamp = new Date().getTime();
    const randomNum = Math.floor(Math.random() * 1000);

    if (this.newUser.firstName && this.newUser.lastName) {
      // Prendre les 3 premières lettres du prénom et du nom (ou moins si plus courts)
      const firstNamePrefix = this.newUser.firstName.substring(0, 3).toLowerCase();
      const lastNamePrefix = this.newUser.lastName.substring(0, 3).toLowerCase();

      // Combiner pour créer un ID unique
      return `${firstNamePrefix}${lastNamePrefix}${timestamp.toString().slice(-4)}${randomNum}`;
    }

    // Fallback si prénom ou nom n'est pas disponible
    return `user${timestamp.toString().slice(-6)}${randomNum}`;
  }

  addUser(): void {
    // Validation du prénom et du nom
    if (!this.newUser.firstName || !this.newUser.lastName) {
      this.error = 'Le prénom et le nom sont requis.';
      return;
    }

    if (this.newUser.firstName.length < 3) {
      this.error = 'Le prénom doit contenir au moins 3 caractères.';
      return;
    }

    if (this.newUser.lastName.length < 3) {
      this.error = 'Le nom doit contenir au moins 3 caractères.';
      return;
    }

    // Validation de l'email si fourni
    if (this.newUser.email) {
      const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
      if (!emailRegex.test(this.newUser.email)) {
        this.error = 'Veuillez entrer une adresse email valide.';
        return;
      }
    }

    // Validation de la date de naissance (obligatoire)
    if (!this.newUser.dateOfBirth) {
      this.error = 'La date de naissance est requise.';
      return;
    }

    const maxDate = new Date('2005-01-01');
    const dob = new Date(this.newUser.dateOfBirth);
    if (dob > maxDate) {
      this.error = 'La date de naissance doit être antérieure au 01/01/2005.';
      return;
    }

    // Générer automatiquement un ID s'il n'est pas déjà défini
    if (!this.newUser.id) {
      this.newUser.id = this.generateUniqueId();
    }

    // Créer une copie de l'objet pour éviter les références
    const userToAdd = { ...this.newUser };

    // Pour la compatibilité avec le backend, on combine firstName et lastName dans name
    userToAdd.name = `${userToAdd.firstName} ${userToAdd.lastName}`;

    // Pour la compatibilité avec le backend, on copie profession dans role
    userToAdd.role = userToAdd.profession;

    console.log('Envoi de l\'utilisateur au backend:', userToAdd);

    this.loading = true;
    this.userService.addUser(userToAdd).subscribe({
      next: (response) => {
        console.log('User added successfully:', response);
        this.loadUsers();
        this.newUser = {
          id: '',
          firstName: '',
          lastName: '',
          email: '',
          profession: 'etudiant',
          dateOfBirth: '2000-01-01' // Date par défaut
        };
        // Réinitialiser les filtres après l'ajout d'un utilisateur
        this.resetFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error adding user:', error);
        // Afficher le message d'erreur spécifique du serveur s'il existe
        if (error.error && error.error.message) {
          this.error = `Erreur: ${error.error.message}`;
          if (error.error.error) {
            this.error += ` (${error.error.error})`;
          }
        } else if (error.message) {
          this.error = `Erreur: ${error.message}`;
        } else {
          this.error = 'Impossible d\'ajouter l\'utilisateur. Veuillez réessayer plus tard.';
        }

        // Afficher plus de détails dans la console pour le débogage
        console.error('Détails de l\'erreur:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error
        });

        this.loading = false;
      }
    });
  }

  editUser(user: User): void {
    this.isEditing = true;
    this.selectedUser = { ...user };

    // Copier les champs pertinents
    this.newUser = {
      _id: user._id,
      id: user.id || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      profession: user.profession || user.role || 'etudiant',
      dateOfBirth: user.dateOfBirth
    };

    // Pour la compatibilité avec les anciens utilisateurs
    if (!user.firstName && user.name) {
      // Si firstName n'est pas défini mais name l'est, utiliser name comme lastName
      this.newUser.lastName = user.name;
    }
  }

  updateUser(): void {
    if (!this.newUser._id || !this.newUser.firstName || !this.newUser.lastName) {
      this.error = 'Prénom et nom sont requis.';
      return;
    }

    // S'assurer que l'ID est présent
    if (!this.newUser.id) {
      this.error = 'ID utilisateur manquant. Impossible de mettre à jour.';
      return;
    }

    // Validation du prénom et du nom
    if (this.newUser.firstName.length < 3) {
      this.error = 'Le prénom doit contenir au moins 3 caractères.';
      return;
    }

    if (this.newUser.lastName.length < 3) {
      this.error = 'Le nom doit contenir au moins 3 caractères.';
      return;
    }

    // Validation de l'email si fourni
    if (this.newUser.email) {
      const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
      if (!emailRegex.test(this.newUser.email)) {
        this.error = 'Veuillez entrer une adresse email valide.';
        return;
      }
    }

    // Validation de la date de naissance (obligatoire)
    if (!this.newUser.dateOfBirth) {
      this.error = 'La date de naissance est requise.';
      return;
    }

    const maxDate = new Date('2005-01-01');
    const dob = new Date(this.newUser.dateOfBirth);
    if (dob > maxDate) {
      this.error = 'La date de naissance doit être antérieure au 01/01/2005.';
      return;
    }

    // Créer une copie de l'objet pour éviter les références
    const userToUpdate = { ...this.newUser };

    // Pour la compatibilité avec le backend, on combine firstName et lastName dans name
    userToUpdate.name = `${userToUpdate.firstName} ${userToUpdate.lastName}`;

    // Pour la compatibilité avec le backend, on copie profession dans role
    userToUpdate.role = userToUpdate.profession;

    console.log('Mise à jour de l\'utilisateur:', userToUpdate);

    this.loading = true;
    this.userService.updateUser(userToUpdate._id!, userToUpdate).subscribe({
      next: (response) => {
        console.log('User updated successfully:', response);
        this.loadUsers();
        this.isEditing = false;
        this.newUser = {
          id: '',
          firstName: '',
          lastName: '',
          email: '',
          profession: 'etudiant',
          dateOfBirth: '2000-01-01' // Date par défaut
        };
        // Appliquer les filtres après la mise à jour
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error updating user:', error);
        // Afficher le message d'erreur spécifique du serveur s'il existe
        if (error.error && error.error.message) {
          this.error = `Erreur: ${error.error.message}`;
        } else {
          this.error = 'Impossible de mettre à jour l\'utilisateur. Veuillez réessayer plus tard.';
        }
        this.loading = false;
      }
    });
  }

  deleteUser(id: string): void {
    if (!id) {
      this.error = 'ID utilisateur manquant.';
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur?')) {
      this.loading = true;
      this.userService.deleteUser(id).subscribe({
        next: () => {
          console.log('User deleted successfully');
          this.loadUsers();
          // Appliquer les filtres après la suppression
          this.applyFilters();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.error = 'Impossible de supprimer l\'utilisateur. Veuillez réessayer plus tard.';
          this.loading = false;
        }
      });
    }
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.newUser = {
      id: '',
      firstName: '',
      lastName: '',
      email: '',
      profession: 'etudiant',
      dateOfBirth: '2000-01-01' // Date par défaut
    };
  }

  // Méthode pour faire défiler jusqu'au formulaire
  scrollToForm(): void {
    const formElement = document.getElementById('userForm');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

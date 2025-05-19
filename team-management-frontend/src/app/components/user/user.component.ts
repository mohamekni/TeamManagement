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
  newUser: User = {
    name: '',
    email: '',
    role: '',
    department: '',
    position: ''
  };
  selectedUser: User | null = null;
  isEditing = false;
  loading = false;
  error: string | null = null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (data) => {
        console.log('Users loaded:', data);
        this.users = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.error = 'Impossible de charger les utilisateurs. Veuillez réessayer plus tard.';
        this.loading = false;
      }
    });
  }

  addUser(): void {
    if (!this.newUser.name || !this.newUser.email) {
      this.error = 'Le nom et l\'email sont requis.';
      return;
    }

    this.loading = true;
    this.userService.addUser(this.newUser).subscribe({
      next: (response) => {
        console.log('User added successfully:', response);
        this.loadUsers();
        this.newUser = {
          name: '',
          email: '',
          role: '',
          department: '',
          position: ''
        };
        this.loading = false;
      },
      error: (error) => {
        console.error('Error adding user:', error);
        // Afficher le message d'erreur spécifique du serveur s'il existe
        if (error.error && error.error.message) {
          this.error = `Erreur: ${error.error.message}`;
        } else {
          this.error = 'Impossible d\'ajouter l\'utilisateur. Veuillez réessayer plus tard.';
        }
        this.loading = false;
      }
    });
  }

  editUser(user: User): void {
    this.isEditing = true;
    this.selectedUser = { ...user };
    this.newUser = { ...user };
  }

  updateUser(): void {
    if (!this.newUser._id || !this.newUser.name || !this.newUser.email) {
      this.error = 'ID, nom et email sont requis.';
      return;
    }

    this.loading = true;
    this.userService.updateUser(this.newUser._id, this.newUser).subscribe({
      next: (response) => {
        console.log('User updated successfully:', response);
        this.loadUsers();
        this.isEditing = false;
        this.newUser = {
          name: '',
          email: '',
          role: '',
          department: '',
          position: ''
        };
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
      name: '',
      email: '',
      role: '',
      department: '',
      position: ''
    };
  }
}

export interface User {
  _id?: string;
  id?: string;
  firstName?: string; // Prénom
  lastName?: string;  // Nom
  profession?: string; // Étudiant ou Professeur
  dateOfBirth?: Date | string; // Date de naissance

  // Champs optionnels pour la compatibilité avec le backend existant
  name?: string;
  email?: string;
  password?: string;
  role?: string;      // Gardé pour la compatibilité avec le backend
  department?: string;
  position?: string;
  phoneNumber?: string;
  address?: string;
  profilePicture?: string;
  bio?: string;
  skills?: string[];
  joinDate?: Date;
  lastActive?: Date;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

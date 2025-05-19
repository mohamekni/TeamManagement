const mongoose = require('mongoose');

// Définition du schéma utilisateur
const userSchema = new mongoose.Schema({
  // Champs principaux selon les besoins
  id: {
    type: String,
    trim: true,
    required: [true, 'L\'ID est requis'],
    unique: true
  },
  firstName: {
    type: String,
    required: [true, 'Le prénom est requis'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true
  },
  profession: {
    type: String,
    enum: ['etudiant', 'professeur'],
    required: [true, 'La profession est requise'],
    default: 'etudiant'
  },
  // Garder role pour la compatibilité
  role: {
    type: String,
    enum: ['etudiant', 'professeur', 'admin', 'manager', 'developer', 'designer', 'tester', ''],
    default: ''
  },
  dateOfBirth: {
    type: Date
  },

  // Champs existants pour la compatibilité
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: false,
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères']
  },
  department: {
    type: String,
    trim: true
  },
  position: {
    type: String,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  profilePicture: {
    type: String
  },
  bio: {
    type: String
  },
  skills: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Création du modèle à partir du schéma
const User = mongoose.model('User', userSchema);

module.exports = User;

const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Middleware pour gérer les erreurs
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// GET tous les utilisateurs
router.get('/', asyncHandler(async (req, res) => {
  const users = await User.find();
  res.status(200).json(users);
}));

// GET un utilisateur par ID
router.get('/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }

  res.status(200).json(user);
}));

// POST créer un nouvel utilisateur
router.post('/', asyncHandler(async (req, res) => {
  // Vérifier si l'ID existe déjà
  if (req.body.id) {
    const existingUser = await User.findOne({ id: req.body.id });
    if (existingUser) {
      return res.status(400).json({ message: 'Un utilisateur avec cet ID existe déjà' });
    }
  }

  // Vérifier si l'email existe déjà (si fourni)
  if (req.body.email) {
    const existingUserEmail = await User.findOne({ email: req.body.email });
    if (existingUserEmail) {
      return res.status(400).json({ message: 'Un utilisateur avec cet email existe déjà' });
    }
  }

  console.log('Création d\'un nouvel utilisateur:', req.body);

  try {
    // Générer un ID automatiquement si aucun n'est fourni
    if (!req.body.id) {
      console.log('ID manquant dans la requête, génération automatique');
      const timestamp = new Date().getTime();
      const randomNum = Math.floor(Math.random() * 1000);

      if (req.body.firstName && req.body.lastName) {
        // Prendre les 3 premières lettres du prénom et du nom (ou moins si plus courts)
        const firstNamePrefix = req.body.firstName.substring(0, 3).toLowerCase();
        const lastNamePrefix = req.body.lastName.substring(0, 3).toLowerCase();

        // Combiner pour créer un ID unique
        req.body.id = `${firstNamePrefix}${lastNamePrefix}${timestamp.toString().slice(-4)}${randomNum}`;
      } else {
        // Fallback si prénom ou nom n'est pas disponible
        req.body.id = `user${timestamp.toString().slice(-6)}${randomNum}`;
      }

      console.log('ID généré automatiquement:', req.body.id);
    }
    if (!req.body.firstName) {
      console.error('Prénom manquant dans la requête');
      return res.status(400).json({ message: 'Le prénom est requis' });
    }
    if (!req.body.lastName) {
      console.error('Nom manquant dans la requête');
      return res.status(400).json({ message: 'Le nom est requis' });
    }
    if (!req.body.profession) {
      console.error('Profession manquante dans la requête');
      return res.status(400).json({ message: 'La profession est requise' });
    }

    // Créer un nouvel objet utilisateur avec seulement les champs nécessaires
    const userData = {
      id: req.body.id,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      profession: req.body.profession,
      name: `${req.body.firstName} ${req.body.lastName}`,
      role: req.body.profession,
      dateOfBirth: req.body.dateOfBirth
    };

    // Ajouter l'email s'il est fourni
    if (req.body.email) {
      userData.email = req.body.email;
    }

    console.log('Données utilisateur filtrées:', userData);

    const user = new User(userData);
    console.log('Modèle utilisateur créé:', user);

    const savedUser = await user.save();
    console.log('Utilisateur créé avec succès:', savedUser);
    res.status(201).json(savedUser);
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    console.error('Message d\'erreur:', error.message);
    console.error('Code d\'erreur:', error.code);

    // Erreur de duplication (code 11000)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        message: `Un utilisateur avec cet ${field} existe déjà`,
        error: error.message
      });
    }

    // Erreur de validation
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Erreur de validation',
        error: errors.join(', ')
      });
    }

    res.status(400).json({
      message: 'Erreur lors de la création de l\'utilisateur',
      error: error.message
    });
  }
}));

// PUT mettre à jour un utilisateur
router.put('/:id', asyncHandler(async (req, res) => {
  // Vérifier si l'ID existe déjà (sauf pour l'utilisateur actuel)
  if (req.body.id) {
    const existingUser = await User.findOne({
      id: req.body.id,
      _id: { $ne: req.params.id }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Un utilisateur avec cet ID existe déjà' });
    }
  }

  // Vérifier si l'email existe déjà (sauf pour l'utilisateur actuel)
  if (req.body.email) {
    const existingUser = await User.findOne({
      email: req.body.email,
      _id: { $ne: req.params.id }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Un utilisateur avec cet email existe déjà' });
    }
  }

  console.log('Mise à jour de l\'utilisateur:', req.params.id, req.body);

  try {
    // Vérifier les champs requis
    if (!req.body.id) {
      console.error('ID manquant dans la requête');
      return res.status(400).json({ message: 'L\'ID est requis' });
    }
    if (!req.body.firstName) {
      console.error('Prénom manquant dans la requête');
      return res.status(400).json({ message: 'Le prénom est requis' });
    }
    if (!req.body.lastName) {
      console.error('Nom manquant dans la requête');
      return res.status(400).json({ message: 'Le nom est requis' });
    }
    if (!req.body.profession) {
      console.error('Profession manquante dans la requête');
      return res.status(400).json({ message: 'La profession est requise' });
    }

    // Créer un objet utilisateur avec seulement les champs nécessaires
    const userData = {
      id: req.body.id,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      profession: req.body.profession,
      name: `${req.body.firstName} ${req.body.lastName}`,
      role: req.body.profession,
      dateOfBirth: req.body.dateOfBirth
    };

    // Ajouter l'email s'il est fourni
    if (req.body.email) {
      userData.email = req.body.email;
    }

    console.log('Données utilisateur filtrées pour mise à jour:', userData);

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      userData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    console.log('Utilisateur mis à jour avec succès:', updatedUser);
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    console.error('Message d\'erreur:', error.message);
    console.error('Code d\'erreur:', error.code);

    // Erreur de duplication (code 11000)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        message: `Un utilisateur avec cet ${field} existe déjà`,
        error: error.message
      });
    }

    // Erreur de validation
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Erreur de validation',
        error: errors.join(', ')
      });
    }

    res.status(400).json({
      message: 'Erreur lors de la mise à jour de l\'utilisateur',
      error: error.message
    });
  }
}));

// DELETE supprimer un utilisateur
router.delete('/:id', asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }

  res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
}));

module.exports = router;

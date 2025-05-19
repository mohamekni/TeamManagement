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
  // Vérifier si l'email existe déjà
  const existingUser = await User.findOne({ email: req.body.email });
  if (existingUser) {
    return res.status(400).json({ message: 'Un utilisateur avec cet email existe déjà' });
  }
  
  const user = new User(req.body);
  const savedUser = await user.save();
  
  res.status(201).json(savedUser);
}));

// PUT mettre à jour un utilisateur
router.put('/:id', asyncHandler(async (req, res) => {
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
  
  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!updatedUser) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }
  
  res.status(200).json(updatedUser);
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

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const TeamMember = require("../models/TeamMember")


//Récupérer tous les membres d'équipe
router.get('/', async (req, res) => {
    try {
        const members = await TeamMember.find()
        res.status(200).json(members);
        } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


//Récupérer un membre spécifique par ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "ID invalide." });
    }
    const member = await TeamMember.findById(id)
    if (!member) {
        return res.status(404).json({ message: "Membre non trouvé." });
    }
    res.status(200).json(member);
    } catch (err) {
    res.status(500).json({ message: err.message });
    }
});

// Vérifier si le membre existe déjà dans l'équipe avant de l'ajouter
router.post('/', async (req, res) => {
    try {
        const { team, user, role } = req.body;
        if (!mongoose.Types.ObjectId.isValid(team) || !mongoose.Types.ObjectId.isValid(user)) {
        return res.status(400).json({ message: "ID de l'équipe ou de l'utilisateur invalide." });
    }
      // 🔍 Vérifier si ce membre est déjà dans cette équipe
    const existingMember = await TeamMember.findOne({ team, user });
    if (existingMember) {
        return res.status(400).json({ message: "Ce membre est déjà dans l'équipe." });
    }
    // Vérifier si le membre est déjà admin de l'équipe
    if (role === "admin") {
        const isAlreadyAdmin = await TeamMember.findOne({ team, role: "admin" });
        if (isAlreadyAdmin) {
            return res.status(400).json({ message: "Il y a déjà un admin pour cette équipe." });
        }
    }
      // Ajouter le nouveau membre
    const newMember = new TeamMember({
        team: new mongoose.Types.ObjectId(team),
        user: new mongoose.Types.ObjectId(user),
        role
    });
    const savedMember = await newMember.save();
    res.status(201).json(savedMember);
    } catch (err) {
    res.status(500).json({ message: err.message });
    }
});

//Supprimer un membre d'équipe
router.delete('/:id', async (req, res) => {
    try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "ID invalide." });
    }

    const deletedMember = await TeamMember.findByIdAndDelete(id);

    if (!deletedMember) {
        return res.status(404).json({ message: "Membre non trouvé." });
    }

    res.status(200).json({ message: "Membre supprimé avec succès." });
    } catch (err) {
    res.status(500).json({ message: err.message });
    }
});

module.exports = router;

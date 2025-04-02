const express = require('express');
const router = express.Router();
const {Team} = require('../models/Team'); // Importer le modèle Team


// Récupérer toutes les équipes
/**
 * @desc Get All Teams
 * @route /
 * @Method GET
 * @access public
 */

router.get('/', async (req, res) => {
    try {
        const teams = await Team.find();
        res.status(200).json(teams);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});




// Créer une nouvelle équipe
/**
 * @desc Get All Teams
 * @route /
 * @Method GET
 * @access public
 */
router.post('/', async (req, res) => {
    try {
    const { name, description, admin, members } = req.body;

    // Vérifier si l'équipe existe déjà
    const existingTeam = await Team.findOne({ name });
    if (existingTeam) {
        return res.status(400).json({ message: "L'équipe existe déjà." });
    }

    // Créer une nouvelle équipe
    const newTeam = new Team({
        name,
        description,
        admin,
        members,
    });

    await newTeam.save();
    res.status(201).json(newTeam);
        } catch (err) {
    res.status(500).json({ message: err.message });
        }
});

// Récupérer une équipe par son ID
/**
 * @desc Get Teams by ID
 * @route /
 * @Method GET
 * @access public
 */
router.get('/:id', async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);
        if (!team) {
        return res.status(404).json({ message: "Équipe non trouvée" });
    }
    res.status(200).json(team);
    } catch (err) {
    res.status(500).json({ message: err.message });
    }
});

// Mettre à jour une équipe par son ID
/**
 * @desc Mise a jour dun equipe 
 * @route /
 * @Method PUT
 * @access public
 */
router.put('/:id', async (req, res) => {
    try {
        const { name, description, admin, members } = req.body;

    const team = await Team.findById(req.params.id);
    if (!team) {
        return res.status(404).json({ message: "Équipe non trouvée" });
    }

    // Mise à jour de l'équipe
    team.name = name || team.name;
    team.description = description || team.description;
    team.admin = admin || team.admin;
    team.members = members || team.members;

    await team.save();
    res.status(200).json(team);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Supprimer une équipe par son ID
/**
 * @desc Delete Team
 * @route /
 * @Method DELETE
 * @access public
 */
router.delete('/:id', async (req, res) => {
    const team = await Team.findById(req.body.id)
    if(team){
        await Team.findByIdAndDelete(req.body.id)
        res.status(200).json({message:"Team has been Deleted"})
    }else{
        res.status(404).json({message:"Team Not FOUND"})
    }
});

module.exports = router;

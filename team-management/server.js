const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const teamRoutes = require('./routes/teamRoute');
const teamMemberRoutes = require("./routes/teamMemberRoute");
const projectsRoutes = require('./routes/projectRoutes')// Import des routes des projets

dotenv.config();

const app = express();

// Middleware pour parser le JSON
app.use(express.json());
app.use(cors());

// Connexion à MongoDB
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connecté"))
    .catch(err => console.error("Erreur de connexion MongoDB "));


// Utiliser les routes
app.use('/api/teams', teamRoutes);
app.use('/api/teammembers', teamMemberRoutes);
app.use('/api/projects', projectsRoutes);

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is Running : ${PORT}`));
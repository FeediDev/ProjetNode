require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');  // ✅ Utilisation de db.js
const appointmentRoutes = require('./routes/appointmentRoutes');
const authRoutes = require('./routes/authRoutes');

dotenv.config();  // Charge les variables d'environnement
connectDB();  // ✅ Connexion à la base de données via db.js

const app = express();

// Middleware
app.use(cors());
app.use(express.json());  // Permet de parser les requêtes JSON

// Définition des routes
app.use('/api/appointments', appointmentRoutes);
app.use('/api/auth', authRoutes);

// Gestion des erreurs 404
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Lancement du serveur
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

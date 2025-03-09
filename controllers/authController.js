const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Fonction pour enregistrer un nouvel utilisateur
const register = async (req, res) => {
    const { name, email, password, role } = req.body;

    // Validation des champs
    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: "Veuillez fournir tous les champs requis : nom, email, mot de passe et rôle" });
    }

    // Vérification du rôle
    const validRoles = ["admin", "client", "professional"];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ message: "Rôle invalide. Choisissez entre 'admin', 'client' ou 'professional'." });
    }

    try {
        // Vérifie si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Un utilisateur avec cet email existe déjà" });
        }

        // Hash du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Création de l'utilisateur avec le rôle
        const user = new User({ name, email, password: hashedPassword, role });
        await user.save();

        // Génération du token avec le rôle
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ message: "Utilisateur enregistré avec succès", token });
    } catch (error) {
        console.error("Erreur lors de l'enregistrement :", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
};

// Fonction pour connecter un utilisateur
const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Veuillez fournir un email et un mot de passe" });
    }

    try {
        // Trouver l'utilisateur par email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect" });
        }

        // Vérifier le mot de passe
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect" });
        }

        // Générer un token JWT avec le rôle
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Envoyer l'utilisateur avec son rôle
        res.json({ message: "Connexion réussie", token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        console.error("Erreur lors de la connexion :", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
};

module.exports = { register, login };

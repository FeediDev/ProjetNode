require('dotenv').config();
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

// Middleware pour vérifier le token JWT
const verifyToken = (req, res, next) => {
  // Récupère le token de l'en-tête Authorization
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Aucun token, autorisation refusée' });
  }

  const token = authHeader.split(' ')[1]; // "Bearer <token>"

  try {
    // Vérifie le token
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // Ajoute les données du token à la requête
    next(); // Passe à la prochaine étape du middleware
  } catch (err) {
    // Gère les erreurs spécifiques de JWT
    let message = 'Token invalide';
    if (err.name === 'TokenExpiredError') {
      message = 'Le token a expiré';
    } else if (err.name === 'JsonWebTokenError') {
      message = 'Token invalide';
    }
    return res.status(401).json({ message });
  }
};

// Middleware pour vérifier les rôles (acceptant un tableau de rôles)
const checkRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: `Accès refusé. Rôle requis : ${roles.join(' ou ')}` });
  }
  next();
};

module.exports = { verifyToken, checkRole };

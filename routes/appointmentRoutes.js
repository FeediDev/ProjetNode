const express = require('express');
const {
    createAppointment,
    getAllAppointments,
    getUserAppointments,
    updateAppointment,
    deleteAppointment
} = require('../controllers/appointmentController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Route pour créer un rendez-vous (accessible uniquement aux clients)
router.post('/', verifyToken, checkRole('client'), createAppointment);  // Cette route appelle la fonction createAppointment, qui inclut l'envoi de l'email.

// Route pour récupérer les rendez-vous de l'utilisateur connecté (client ou professionnel)
router.get('/', verifyToken, getUserAppointments);

// Route pour récupérer tous les rendez-vous (accessible uniquement aux administrateurs)
router.get('/all', verifyToken, checkRole('admin'), getAllAppointments);

// Route pour mettre à jour un rendez-vous (accessible au client ou au professionnel concerné)
router.put('/:id', verifyToken, updateAppointment);

// Route pour supprimer un rendez-vous (accessible au client ou au professionnel concerné)
router.delete('/:id', verifyToken, deleteAppointment);

module.exports = router;

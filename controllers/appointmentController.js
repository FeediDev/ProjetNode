const Appointment = require("../models/Appointment");
const sendEmail = require("../utils/emailService");  // Assurez-vous que ce chemin est correct

// 📌 Créer un rendez-vous
const createAppointment = async (req, res) => {
    try {
        const { name, email, phone, department, doctor, date, message } = req.body;

        // Vérifier si l'utilisateur est autorisé à créer un rendez-vous
        if (req.user.role !== "client") {
            return res.status(403).json({ message: "Seuls les clients peuvent créer un rendez-vous" });
        }

        // Vérifier si la date est valide
        const appointmentDate = new Date(date);
        if (isNaN(appointmentDate.getTime())) {
            return res.status(400).json({ message: 'Format de date invalide' });
        }

        // Créer un nouveau rendez-vous
        const appointment = new Appointment({
            name,
            email,
            phone,
            department,
            doctor,
            date: appointmentDate,
            message,
            status: 'scheduled',
            client: req.user.id  // Assigner le client connecté à ce rendez-vous
        });

        // Sauvegarder le rendez-vous dans la base de données
        await appointment.save();

        // Envoi de l'email de confirmation
        const emailSubject = "Confirmation de Rendez-vous";
        const emailText = `
            Bonjour ${name},

            Votre rendez-vous a été confirmé avec ${doctor} dans le département ${department}.
            Date du rendez-vous: ${appointmentDate.toLocaleString()}.
            Message: ${message}

            Merci de votre confiance !
        `;

        // Appel de la fonction sendEmail pour envoyer l'email
        await sendEmail(email, emailSubject, emailText);

        // Retourner une réponse de succès
        res.status(201).json({ message: 'Rendez-vous créé avec succès', appointment });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur lors de la création du rendez-vous', error: err.message });
    }
};

// 📌 Récupérer tous les rendez-vous (Admin)
const getAllAppointments = async (req, res) => {
    try {
        // Vérifier que l'utilisateur est un admin
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Accès refusé. Réservé aux administrateurs" });
        }

        const appointments = await Appointment.find().populate("client professional", "name email");
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des rendez-vous", error: error.message });
    }
};

// 📌 Récupérer les rendez-vous d'un utilisateur (client ou professionnel)
const getUserAppointments = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;

        let query = {};

        // Si l'utilisateur est un admin, il peut voir tous les rendez-vous
        if (role === "admin") {
            query = {};  // Pas de filtre, l'admin peut voir tous les rendez-vous
        } else if (role === "client") {
            query.client = userId;  // Le client peut uniquement voir ses rendez-vous
        } else if (role === "professional") {
            query.professional = userId;  // Le professionnel peut uniquement voir ses rendez-vous
        } else {
            return res.status(403).json({ message: "Accès refusé. Utilisateur non valide." });
        }

        // Récupérer les rendez-vous en fonction du rôle de l'utilisateur
        const appointments = await Appointment.find(query).populate("client professional", "name email");
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des rendez-vous", error: error.message });
    }
};


// 📌 Modifier un rendez-vous (ex: changer la date)
const updateAppointment = async (req, res) => {
    try {
        const { date, status, message, name } = req.body;  // Tu peux ajouter d'autres champs si nécessaire
        const appointmentId = req.params.id;

        // Vérifier que la date est valide et dans le futur
        if (date) {
            const appointmentDate = new Date(date);
            if (isNaN(appointmentDate.getTime()) || appointmentDate < new Date()) {
                return res.status(400).json({ message: "Date invalide ou passée" });
            }
        }

        // Vérifier que l'utilisateur est autorisé à modifier ce rendez-vous
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: "Rendez-vous introuvable" });
        }

        // Admin peut modifier tous les rendez-vous
        if (req.user.role === "admin") {
            const updatedAppointment = await Appointment.findByIdAndUpdate(
                appointmentId,
                { name, date, status, message },
                { new: true, runValidators: true } // Assurez-vous que les validateurs sont exécutés
            ).populate("client professional", "name email");

            return res.json({ message: "Rendez-vous mis à jour", appointment: updatedAppointment });
        }

        // Le professionnel ne peut modifier que ses propres rendez-vous
        if (req.user.role === "professional" && appointment.professional.toString() !== req.user.id) {
            return res.status(403).json({ message: "Vous n'êtes pas autorisé à modifier ce rendez-vous" });
        }

        // Le client ne peut modifier que ses propres rendez-vous
        if (req.user.role === "client" && appointment.client.toString() !== req.user.id) {
            return res.status(403).json({ message: "Vous n'êtes pas autorisé à modifier ce rendez-vous" });
        }

        // Mettre à jour le rendez-vous
        const updatedAppointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            { name, date, status, message },
            { new: true, runValidators: true }
        ).populate("client professional", "name email");

        res.json({ message: "Rendez-vous mis à jour", appointment: updatedAppointment });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour du rendez-vous", error: error.message });
    }
};




// 📌 Supprimer un rendez-vous
const deleteAppointment = async (req, res) => {
    try {
        const appointmentId = req.params.id;

        // ✅ Vérifier si l'ID est au bon format ObjectId
        if (!appointmentId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "ID de rendez-vous invalide" });
        }

        // ✅ Vérifier si le rendez-vous existe
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: "Rendez-vous introuvable" });
        }

        // ✅ Seuls l'admin et le professionnel peuvent supprimer le rendez-vous
        if (req.user.role !== "admin" && (req.user.role !== "professional" || appointment.professional?.toString() !== req.user.id)) {
            return res.status(403).json({ message: "Vous n'êtes pas autorisé à supprimer ce rendez-vous" });
        }

        // ✅ Supprimer le rendez-vous
        await Appointment.findByIdAndDelete(appointmentId);
        res.json({ message: "Rendez-vous supprimé avec succès" });

    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression du rendez-vous", error: error.message });
    }
};

// 📌 Export des fonctions
module.exports = {
    createAppointment,
    getAllAppointments,
    getUserAppointments,
    updateAppointment,
    deleteAppointment
};

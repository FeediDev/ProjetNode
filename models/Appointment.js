const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String, 
      required: true 
    },
    phone: { 
      type: String, 
      required: true 
    },
    department: { 
      type: String, 
      required: true 
    },
    doctor: { 
      type: String, 
      required: true 
    },
    date: { 
      type: Date, 
      required: true 
    },
    message: { 
      type: String, 
      required: true 
    },
    status: { 
      type: String, 
      enum: ["scheduled", "completed", "canceled"], 
      default: "scheduled" 
    },
    created_at: {
      type: Date,
      default: Date.now
    },
    client: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",  // Référence au modèle "User" pour le client
      required: true 
    },
    professional: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",  // Référence au modèle "User" pour le professionnel
      required: true 
    }
  },
  {
    timestamps: true,
    strictPopulate: false  // Désactive la validation stricte pour populate
  }
);

module.exports = mongoose.model('Appointment', appointmentSchema);

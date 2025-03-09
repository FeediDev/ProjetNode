const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
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
    }
}, { timestamps: true });

module.exports = mongoose.model("Appointment", appointmentSchema);

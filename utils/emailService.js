const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',  // Tu peux changer cela si tu utilises un autre service
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            rejectUnauthorized: false  // Contourner l'erreur SSL
        }
    });

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
        });
        console.log('Email sent successfully');
    } catch (err) {
        console.error('Error sending email:', err);
        throw new Error('Error sending email');  // Lancer l'erreur pour la gestion ailleurs
    }
};

module.exports = sendEmail;

const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const stripeLib = require('stripe');
const connectDB = require('./config/db');
const Contact = require('./models/Contact');
const nodemailer = require('nodemailer');
const twilio = require('twilio'); // ✅ Twilio added

dotenv.config();
connectDB();

const app = express();
const stripe = stripeLib(process.env.STRIPE_SECRET_KEY);
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN); // ✅ Twilio client

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Stripe Payment Intent
app.post('/create-payment-intent', async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || isNaN(amount)) {
            return res.status(400).json({ error: "Invalid amount." });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: parseInt(amount) * 100,
            currency: 'usd',
            payment_method_types: ['card'],
        });

        console.log("✅ Payment intent created:", paymentIntent.id);
        res.send({ clientSecret: paymentIntent.client_secret });

    } catch (err) {
        console.error("❌ Stripe error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// ✅ Contact Form Submission with MongoDB + WhatsApp
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: "All fields are required." });
    }

    try {
        const newContact = new Contact({ name, email, message });
        await newContact.save();

        // ✅ Send WhatsApp Message
        await client.messages.create({
            from: process.env.TWILIO_WHATSAPP_NUMBER,  // example: 'whatsapp:+14155238886'
            to: process.env.MY_WHATSAPP_NUMBER,        // your personal number e.g. 'whatsapp:+923113640328'
            body: `📥 New Contact Submission:\n\n👤 Name: ${name}\n📧 Email: ${email}\n📝 Message: ${message}`
        });

        res.status(200).json({ message: "Message saved & WhatsApp notified." });

    } catch (err) {
        console.error("❌ Error:", err.message);
        res.status(500).json({ error: "Server error. Please try again later." });
    }
});

// ✅ Send Email (Optional Route)
app.post('/api/send-email', async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: "All fields are required." });
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: `"${name}" <${email}>`,
        to: process.env.EMAIL_USER,
        subject: `Contact Form: ${subject}`,
        html: `
            <h3>New Contact Form Message</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong><br>${message}</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Email sent successfully." });
    } catch (error) {
        console.error("Email sending error:", error);
        res.status(500).json({ error: "Failed to send email. Try again later." });
    }
});

// Serve main HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

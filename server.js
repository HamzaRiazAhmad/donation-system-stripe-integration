const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const stripeLib = require('stripe');

dotenv.config();

const app = express();
const stripe = stripeLib(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API: Create Payment Intent
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

// Serve main HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

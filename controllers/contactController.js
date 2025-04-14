const Contact = require('../models/Contact');

const submitContactForm = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        const newMessage = new Contact({ name, email, subject, message });
        await newMessage.save();

        res.status(200).json({ success: true, message: "Message sent successfully!" });
    } catch (error) {
        console.error("❌ Contact form error:", error.message);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

module.exports = { submitContactForm };

import ContactForm from "../models/ContactForm.js";
import { sendAdminMail } from "../utils/mailer.js";

/* Create new contact */
export const createContactForm = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newContact = new ContactForm({ name, email, message });
    await newContact.save();

    // Send admin mail
    await sendAdminMail({ name, email, message });

    res.status(201).json({ message: "✅ Contact form submitted successfully" });
  } catch (error) {
    console.error("❌ Error submitting contact form:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* Get all contacts */
export const getAllContacts = async (req, res) => {
  try {
    const contacts = await ContactForm.find().sort({ createdAt: -1 });
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* Delete contact */
export const deleteContact = async (req, res) => {
  try {
    const contact = await ContactForm.findById(req.params.id);
    if (!contact) return res.status(404).json({ message: "Contact not found" });

    await ContactForm.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "🗑️ Contact deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

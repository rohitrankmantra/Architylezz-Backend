import express from "express";
import {
  createContactForm,
  getAllContacts,
  deleteContact,
} from "../controllers/contactFormController.js";

const router = express.Router();

// Public route (for frontend form)
router.post("/", createContactForm);

// Admin routes
router.get("/", getAllContacts);
router.delete("/:id", deleteContact);

export default router;

import { Router } from "express";
import { handleIncomingMessage } from "../controllers/whatsapp.controller.js";

const router = Router();

// Note: Twilio sends POST requests formatted as 'application/x-www-form-urlencoded', 
// so make sure express.urlencoded() is enabled in app.js!
router.post("/webhook", handleIncomingMessage);

export default router;

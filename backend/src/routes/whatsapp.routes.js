import { Router } from "express";
import { handleIncomingMessage } from "../controllers/whatsapp.controller.js";

const router=Router();

router.post("/webhook",handleIncomingMessage);

export default router;

import { Router } from "express";
import { handleChat } from "../controllers/chat.controller.js";

const router=Router();

//we can optionally use verifyJWT if we only want loggedin users to use the bot
router.post("/",handleChat);

export default router;
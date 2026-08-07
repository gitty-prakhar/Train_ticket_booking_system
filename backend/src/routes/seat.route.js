import { Router } from "express";
import { getSeatMap, lockSeats, releaseSeats } from "../controllers/seat.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router();

router.route("/coach/:coachId").get(verifyJWT,getSeatMap);
router.route("/lock").post(verifyJWT,lockSeats);
router.route("/release").post(verifyJWT,releaseSeats);

export default router;

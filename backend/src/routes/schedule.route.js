import { Router } from "express";
import { createSchedule, getScheduleById, getSchedulesByTrain, updateScheduleStatus } from "../controllers/schedule.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyRole } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").post(verifyJWT,verifyRole("admin"),createSchedule);
router.route("/:id/status").patch(verifyJWT,verifyRole("admin"),updateScheduleStatus);
router.route("/:id").get(verifyJWT,getScheduleById);
router.route("/train/:trainId").get(verifyJWT,getSchedulesByTrain);

export default router;

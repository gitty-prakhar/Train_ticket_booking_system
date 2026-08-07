import { Router } from "express";
import { createTrain, getAllTrains,getTrainById, updateTrain, deleteTrain } from "../controllers/train.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyRole } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").get(getAllTrains);
router.route("/:id").get(getTrainById);

//secured routes
router.route("/").post(verifyJWT,verifyRole("admin"),createTrain);
router.route("/:id").patch(verifyJWT,verifyRole("admin"),updateTrain);
router.route("/:id").delete(verifyJWT,verifyRole("admin"),deleteTrain);

//patch only updates the fields provided by the user 
//unlike put which replace all the fields


export default router;

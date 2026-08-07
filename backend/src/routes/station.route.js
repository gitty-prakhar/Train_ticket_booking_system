import { Router } from "express";
import { createStation, getAllStations,getStationByCode, updateStation, deleteStation } from "../controllers/station.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyRole } from "../middlewares/auth.middleware.js";

const router=Router();

router.route("/").get(getAllStations);
router.route("/:").get(getStationByCode);

//secured routes
router.route("/").post(verifyJWT,verifyRole("admin"),createStation);
router.route("/:id").put(verifyJWT,verifyRole("admin"),updateStation);
router.route("/:id").delete(verifyJWT,verifyRole("admin"),deleteStation);

export default router;
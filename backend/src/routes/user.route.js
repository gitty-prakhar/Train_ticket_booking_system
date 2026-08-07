import { Router } from "express";
import { registerUser,loginUser,logoutUser,refreshAccessToken,getCurrentUser,changeCurrentPassword,forgotPassword,resetPassword  } from "../controllers/user.controller";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);

//secured routes
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/current-user").get(verifyJWT,getCurrentUser);
router.route("/change-password").post(verifyJWT,changeCurrentPassword);

export default router;
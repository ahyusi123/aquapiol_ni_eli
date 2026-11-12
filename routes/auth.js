import express from "express";
import { showLogin, login, logout } from "../controllers/authController.js";
import { redirectIfAuth } from "../middleware/auth.js";

const router = express.Router();
router.get("/login", redirectIfAuth, showLogin);
router.post("/login", redirectIfAuth, login);
router.post("/logout", logout);
export default router;

import express from "express";
import { homePage } from "../controllers/homeController.js";
import { dashboard,modulePage,createRecord,deleteRecord,reportPage } from "../controllers/hrController.js";
import authRoutes from "./auth.js";
import { requireAuth } from "../middleware/auth.js";
const router=express.Router();
router.get("/",homePage);
router.use(authRoutes);            // /login  /logout
router.use("/hr",requireAuth);     // every HR page now needs a signed-in user
router.get("/hr",dashboard);
router.get("/hr/reports",reportPage);
router.get("/hr/:module",modulePage);
router.post("/hr/:module",createRecord);
router.post("/hr/:module/delete/:id",deleteRecord);
export default router;

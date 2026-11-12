import express from "express";
import { issueToken, listEmployees, listActiveEmployees, getEmployee, verifyEmployee, listAttendance, listLeaves, listSchedules } from "../controllers/apiController.js";
import { requireApiAuth } from "../middleware/apiAuth.js";

const router = express.Router();
router.post("/auth/token", issueToken);
router.get("/hr/employees/active", requireApiAuth("hr:employees:read"), listActiveEmployees);
router.get("/hr/employees", requireApiAuth("hr:employees:read"), listEmployees);
router.get("/hr/employees/:employeeNo/verify", requireApiAuth("hr:employees:read"), verifyEmployee);
router.get("/hr/employees/:employeeNo", requireApiAuth("hr:employees:read"), getEmployee);
router.get("/hr/attendance", requireApiAuth("hr:attendance:read"), listAttendance);
router.get("/hr/leaves", requireApiAuth("hr:leaves:read"), listLeaves);
router.get("/hr/schedules", requireApiAuth("hr:schedules:read"), listSchedules);
export default router;

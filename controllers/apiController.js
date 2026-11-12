import bcrypt from "bcrypt";
import { User } from "../models/userModel.js";
import { Employee, Attendance, LeaveRequest, WorkSchedule } from "../models/hrModels.js";
import { createAccessToken } from "../middleware/apiAuth.js";

const sendError = (res, status, code, message) =>
  res.status(status).json({ success: false, error: { code, message } });

export async function issueToken(req, res) {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    if (!email || !password) return sendError(res, 400, "VALIDATION_ERROR", "Email and password are required.");
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return sendError(res, 401, "INVALID_CREDENTIALS", "Invalid email or password.");
    return res.json({ success: true, data: {
      access_token: createAccessToken(user), token_type: "Bearer", expires_in: 3600,
      scope: ["hr:employees:read", "hr:attendance:read", "hr:leaves:read", "hr:schedules:read"]
    }});
  } catch (error) {
    console.error("API token error:", error);
    return sendError(res, 500, "INTERNAL_ERROR", "Unable to issue access token.");
  }
}

export async function listEmployees(req, res) {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 25));
    const where = {};
    if (req.hrStatus || req.query.status) where.employmentStatus = String(req.hrStatus || req.query.status);
    const result = await Employee.findAndCountAll({
      where, attributes: ["employeeNo", "firstName", "lastName", "email", "phone", "position", "department", "employmentStatus", "hireDate"],
      order: [["employeeNo", "ASC"]], limit, offset: (page - 1) * limit
    });
    res.json({ success: true, data: result.rows, meta: { page, limit, total: result.count, totalPages: Math.ceil(result.count / limit) } });
  } catch (error) {
    console.error("API list employees error:", error);
    sendError(res, 500, "INTERNAL_ERROR", "Unable to retrieve employees.");
  }
}

export function listActiveEmployees(req, res) { req.hrStatus = "Active"; return listEmployees(req, res); }

export async function getEmployee(req, res) {
  try {
    const employee = await Employee.findOne({
      where: { employeeNo: req.params.employeeNo },
      attributes: ["employeeNo", "firstName", "lastName", "email", "phone", "position", "department", "employmentStatus", "hireDate"]
    });
    if (!employee) return sendError(res, 404, "EMPLOYEE_NOT_FOUND", "Employee was not found.");
    res.json({ success: true, data: employee });
  } catch (error) {
    console.error("API get employee error:", error);
    sendError(res, 500, "INTERNAL_ERROR", "Unable to retrieve employee.");
  }
}

export async function verifyEmployee(req, res) {
  try {
    const employee = await Employee.findOne({
      where: { employeeNo: req.params.employeeNo },
      attributes: ["employeeNo", "firstName", "lastName", "position", "department", "employmentStatus"]
    });
    if (!employee) return res.json({ success: true, data: { verified: false, reason: "NOT_FOUND" } });
    const active = String(employee.employmentStatus || "").toLowerCase() === "active";
    res.json({ success: true, data: {
      verified: active, reason: active ? "ACTIVE" : "INACTIVE",
      employee: { employeeNo: employee.employeeNo, firstName: employee.firstName, lastName: employee.lastName, position: employee.position, department: employee.department }
    }});
  } catch (error) {
    console.error("API verify employee error:", error);
    sendError(res, 500, "INTERNAL_ERROR", "Unable to verify employee.");
  }
}

function listHandler(Model, scope) {
  return async (req, res) => {
    try {
      const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
      const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 25));
      const result = await Model.findAndCountAll({ order: [["createdAt", "DESC"]], limit, offset: (page - 1) * limit });
      res.json({ success: true, data: result.rows, meta: { page, limit, total: result.count, totalPages: Math.ceil(result.count / limit) } });
    } catch (error) {
      console.error(`API ${scope} error:`, error);
      sendError(res, 500, "INTERNAL_ERROR", `Unable to retrieve ${scope}.`);
    }
  };
}
export const listAttendance = listHandler(Attendance, "attendance");
export const listLeaves = listHandler(LeaveRequest, "leaves");
export const listSchedules = listHandler(WorkSchedule, "schedules");

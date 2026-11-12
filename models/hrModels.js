import { DataTypes } from "sequelize";
import { sequelize } from "./db.js";

const common = { timestamps: true };
export const Employee = sequelize.define("Employee", {
 employeeNo:{type:DataTypes.STRING,unique:true,allowNull:false}, firstName:{type:DataTypes.STRING,allowNull:false},
 lastName:{type:DataTypes.STRING,allowNull:false}, email:DataTypes.STRING, phone:DataTypes.STRING,
 address:DataTypes.STRING, position:DataTypes.STRING, department:DataTypes.STRING,
 employmentStatus:{type:DataTypes.STRING,defaultValue:"Active"}, hireDate:DataTypes.DATEONLY
},common);
export const Attendance = sequelize.define("Attendance",{employeeNo:DataTypes.STRING,employeeName:DataTypes.STRING,
 date:DataTypes.DATEONLY, timeIn:DataTypes.STRING,timeOut:DataTypes.STRING,status:{type:DataTypes.STRING,defaultValue:"Present"}},common);
export const LeaveRequest = sequelize.define("LeaveRequest",{employeeNo:DataTypes.STRING,employeeName:DataTypes.STRING,
 leaveType:DataTypes.STRING,startDate:DataTypes.DATEONLY,endDate:DataTypes.DATEONLY,reason:DataTypes.TEXT,
 status:{type:DataTypes.STRING,defaultValue:"Pending"}},common);
export const WorkSchedule = sequelize.define("WorkSchedule",{employeeNo:DataTypes.STRING,employeeName:DataTypes.STRING,
 workDays:DataTypes.STRING,shift:DataTypes.STRING,startTime:DataTypes.STRING,endTime:DataTypes.STRING},common);
export const Payroll = sequelize.define("Payroll",{employeeNo:DataTypes.STRING,employeeName:DataTypes.STRING,
 period:DataTypes.STRING,basicSalary:{type:DataTypes.DECIMAL(12,2),defaultValue:0},allowances:{type:DataTypes.DECIMAL(12,2),defaultValue:0},
 deductions:{type:DataTypes.DECIMAL(12,2),defaultValue:0},netPay:{type:DataTypes.DECIMAL(12,2),defaultValue:0}},common);
export const EmployeeRecord = sequelize.define("EmployeeRecord",{employeeNo:DataTypes.STRING,employeeName:DataTypes.STRING,
 documentType:DataTypes.STRING,description:DataTypes.TEXT,recordDate:DataTypes.DATEONLY},common);
export const Performance = sequelize.define("Performance",{employeeNo:DataTypes.STRING,employeeName:DataTypes.STRING,
 reviewPeriod:DataTypes.STRING,score:{type:DataTypes.DECIMAL(5,2),defaultValue:0},remarks:DataTypes.TEXT},common);

// Re-export the shared Sequelize instance for app initialization.
export { sequelize };

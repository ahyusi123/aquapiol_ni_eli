import { Employee, Attendance, LeaveRequest, WorkSchedule, Payroll, EmployeeRecord, Performance } from "../models/hrModels.js";
const modules={
 employees:{model:Employee,title:"Employee Management",subtitle:"Employee profiles and employment records",fields:[
  ["employeeNo","Employee No.","text"],["firstName","First Name","text"],["lastName","Last Name","text"],["email","Email","email"],["phone","Contact Number","text"],["address","Address","text"],["position","Position","text"],["department","Department","text"],["employmentStatus","Status","select:Active,Inactive,On Leave"],["hireDate","Hire Date","date"]]},
 attendance:{model:Attendance,title:"Attendance Monitoring",subtitle:"Daily time-in and time-out tracking",fields:[["employeeNo","Employee No.","text"],["employeeName","Employee Name","text"],["date","Date","date"],["timeIn","Time In","time"],["timeOut","Time Out","time"],["status","Status","select:Present,Late,Absent,Half-day"]]},
 leaves:{model:LeaveRequest,title:"Leave Management",subtitle:"Submit and review employee leave requests",fields:[["employeeNo","Employee No.","text"],["employeeName","Employee Name","text"],["leaveType","Leave Type","select:Vacation,Sick,Emergency,Other"],["startDate","Start Date","date"],["endDate","End Date","date"],["reason","Reason","textarea"],["status","Approval Status","select:Pending,Approved,Rejected"]]},
 schedules:{model:WorkSchedule,title:"Schedule Management",subtitle:"Assign employee work schedules",fields:[["employeeNo","Employee No.","text"],["employeeName","Employee Name","text"],["workDays","Work Days","text"],["shift","Shift","select:Day,Night,Flexible"],["startTime","Start Time","time"],["endTime","End Time","time"]]},
 payroll:{model:Payroll,title:"Payroll Management",subtitle:"Salary, allowances, deductions and net pay",fields:[["employeeNo","Employee No.","text"],["employeeName","Employee Name","text"],["period","Payroll Period","text"],["basicSalary","Basic Salary","number"],["allowances","Allowances","number"],["deductions","Deductions","number"]]},
 records:{model:EmployeeRecord,title:"Employee Records",subtitle:"Employment history and employee documents",fields:[["employeeNo","Employee No.","text"],["employeeName","Employee Name","text"],["documentType","Document Type","text"],["description","Description","textarea"],["recordDate","Record Date","date"]]},
 performance:{model:Performance,title:"Performance Monitoring",subtitle:"Employee evaluation and review results",fields:[["employeeNo","Employee No.","text"],["employeeName","Employee Name","text"],["reviewPeriod","Review Period","text"],["score","Performance Score","number"],["remarks","Remarks","textarea"]]}
};
export async function dashboard(req,res){try{
 const [employees,attendance,leaves,payroll,low] = await Promise.all([Employee.count(),Attendance.count(),LeaveRequest.count({where:{status:"Pending"}}),Payroll.count(),Employee.count({where:{employmentStatus:"Active"}})]);
 res.render("hr/dashboard",{title:"HR Dashboard",active:"dashboard",stats:{employees,attendance,leaves,payroll,active:low}});
}catch(e){console.error(e);res.status(500).send("Dashboard error. Check MySQL connection and database.");}}
export async function modulePage(req,res){const key=req.params.module,config=modules[key];if(!config)return res.status(404).send("Module not found");
 try{const rows=await config.model.findAll({order:[["createdAt","DESC"]],limit:250});res.render("hr/module",{title:config.title,active:key,config,rows,columns:config.fields});}
 catch(e){console.error(e);res.status(500).send("Unable to load module. Check database connection.");}}
export async function createRecord(req,res){const config=modules[req.params.module];if(!config)return res.status(404).send("Module not found");
 try{const data={};for(const [field] of config.fields)data[field]=req.body[field]||null;
 if(req.params.module==="payroll"){const b=Number(data.basicSalary||0),a=Number(data.allowances||0),d=Number(data.deductions||0);data.netPay=b+a-d;}
 await config.model.create(data);req.flash("success_msg","Record added successfully.");res.redirect("/hr/"+req.params.module);}
 catch(e){console.error(e);req.flash("error_msg","Could not save record. Check required fields and unique Employee No.");res.redirect("/hr/"+req.params.module);}}
export async function deleteRecord(req,res){const config=modules[req.params.module];if(!config)return res.status(404).send("Module not found");
 try{await config.model.destroy({where:{id:req.params.id}});req.flash("success_msg","Record deleted.");}catch(e){console.error(e);req.flash("error_msg","Delete failed.");}res.redirect("/hr/"+req.params.module);}
export async function reportPage(req,res){try{const [employees,attendance,leaves,payroll]=await Promise.all([Employee.findAll(),Attendance.findAll(),LeaveRequest.findAll(),Payroll.findAll()]);res.render("hr/reports",{title:"HR Reports",active:"reports",employees,attendance,leaves,payroll});}catch(e){console.error(e);res.status(500).send("Reports unavailable. Check database.");}}

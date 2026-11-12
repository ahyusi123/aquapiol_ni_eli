AQUAPIOL HR REST API
====================

Base URL (same computer):
  http://localhost:3000/api/v1

Health:
  GET /api/health

Authentication:
  POST /api/v1/auth/token
  Content-Type: application/json
  Body: {"email":"admin@aquapiol.com","password":"YOUR_PASSWORD"}

Response:
  {"success":true,"data":{"access_token":"...","token_type":"Bearer","expires_in":3600,"scope":[...]}}

Send this header on protected endpoints:
  Authorization: Bearer <access_token>

Employee endpoints (scope hr:employees:read):
  GET /api/v1/hr/employees?page=1&limit=25
  GET /api/v1/hr/employees/EMP-0001
  GET /api/v1/hr/employees/EMP-0001/verify
  GET /api/v1/hr/employees/active

Other read-only endpoints:
  GET /api/v1/hr/attendance       (hr:attendance:read)
  GET /api/v1/hr/leaves           (hr:leaves:read)
  GET /api/v1/hr/schedules        (hr:schedules:read)

Example cashier verification response:
  {
    "success": true,
    "data": {
      "verified": true,
      "reason": "ACTIVE",
      "employee": {
        "employeeNo": "EMP-0001",
        "firstName": "Juan",
        "lastName": "Dela Cruz",
        "position": "Cashier",
        "department": "POS"
      }
    }
  }

Possible errors:
  400 validation error; 401 missing/invalid/expired token or credentials;
  403 insufficient scope; 404 employee not found; 500 server error.

LOCAL SETUP
1. Extract the project.
2. Start MySQL (for example, XAMPP) and ensure database "behssyko" exists.
3. Run: npm install
4. Run: npm run migrate
5. Run: npm run xian
6. Open http://localhost:3000/login

Existing first-run default login (change immediately):
  admin@aquapiol.com / admin123

SECURITY / DEPLOYMENT
- Set API_TOKEN_SECRET and SESSION_SECRET to long, random secrets before deployment.
- Set DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD for the target MySQL server.
- Set API_CORS_ORIGIN to the exact frontend origin(s) when browser-based cross-origin calls are needed.
- Deploy behind HTTPS. Never expose localhost as a URL for another computer.
- For LAN testing, bind the Node server to 0.0.0.0 and use the host computer's LAN IP:
  http://<HR_SERVER_LAN_IP>:3000/api/v1
  Allow TCP port 3000 only on the trusted LAN/firewall.
- Production deployment should use a process manager/reverse proxy and persistent database backups.
- API tokens expire after one hour. Obtain a new token using the token endpoint.
- The API currently exposes read-only employee/attendance/leave/schedule data. It does not allow external modules to modify HR-owned tables.
- Do not share admin credentials with POS. Create a dedicated HR API integration user in the Users table with a strong password for POS, then use that account to request a token.
- The current token endpoint grants the read scopes listed above to any valid HR login. For production, restrict token issuance to dedicated integration accounts and add role/scope management before deployment.

POS EXAMPLE (Node.js fetch)
  const base = "http://localhost:3000/api/v1";
  const tokenResponse = await fetch(`${base}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: process.env.HR_API_EMAIL, password: process.env.HR_API_PASSWORD })
  });
  const tokenJson = await tokenResponse.json();
  if (!tokenResponse.ok) throw new Error(tokenJson.error?.message || "HR auth failed");

  const employeeNo = "EMP-0001";
  const verifyResponse = await fetch(
    `${base}/hr/employees/${encodeURIComponent(employeeNo)}/verify`,
    { headers: { Authorization: `Bearer ${tokenJson.data.access_token}` } }
  );
  const verifyJson = await verifyResponse.json();
  if (!verifyResponse.ok) throw new Error(verifyJson.error?.message || "HR verification failed");
  if (!verifyJson.data.verified) throw new Error("Cashier is not an active HR employee.");

NOTE
"localhost" works only when the client and HR API run on the same computer.
For separate computers, replace localhost with the HR server's reachable LAN IP or deployed HTTPS domain.

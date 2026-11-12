LOGIN PAGE + SYSTEM ICON  (added on top of your project - nothing removed)
===========================================================================

Default login (auto-created on first visit to /login if the Users table is empty):
    Email:    admin@aquapiol.com
    Password: admin123
Change it after your first login.

How to run (same as before):
    npm install
    npm run migrate      (only if you haven't yet - creates the Users table too)
    npm run xian
Open http://localhost:3000  ->  you are sent to /login, then to /hr after signing in.

NEW FILES
    views/login.xian                  login page
    public/css/auth.css               login styles + icon + sign-out button styles
    public/js/auth.js                 show/hide password
    controllers/authController.js     login / logout (bcrypt + session, 5-tries/10-min lock)
    middleware/auth.js                requireAuth / redirectIfAuth
    routes/auth.js                    GET/POST /login, POST /logout
    public/favicon.ico
    public/img/aquapiol-icon.png (64px), -192.png, -512.png, apple-touch-icon.png,
               aquapiol-icon-original.webp   (your uploaded drop icon)

SMALL ADDITIONS TO EXISTING FILES (nothing deleted)
    routes/index.js            + import of auth routes, + router.use(authRoutes),
                               + router.use("/hr", requireAuth)  -> all /hr pages need login
    views/partials/head.xian   + link to auth.css, favicon / apple-touch-icon / theme-color
    views/hr/dashboard.xian    + "Sign out" button at the bottom of the sidebar
    views/hr/module.xian       + "Sign out" button at the bottom of the sidebar
    views/hr/reports.xian      + "Sign out" button at the bottom of the sidebar

ICON USAGE
    browser tab (favicon), sidebar logo tile, dashboard banner watermark, login page.
    The old star text in your markup is untouched; auth.css just displays the drop instead.

/**
 * Authentication middleware for the HR system.
 * Sessions are already configured in index.js (express-session).
 */

// Blocks pages for anyone who is not signed in and sends them to /login.
export const requireAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    res.locals.authUser = req.session.user;
    // Stop the browser from showing cached private pages after sign-out (Back button).
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
    return next();
  }
  // Remember where the person wanted to go (GET only) so we can return them after login.
  if (req.method === "GET") req.session.returnTo = req.originalUrl;
  req.flash("error_msg", "Please sign in to continue.");
  return res.redirect("/login");
};

// Signed-in users do not need to see the login page again.
export const redirectIfAuth = (req, res, next) => {
  if (req.session && req.session.user) return res.redirect("/hr");
  return next();
};

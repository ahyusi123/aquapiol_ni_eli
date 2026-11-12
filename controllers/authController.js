import bcrypt from "bcrypt";
import { User } from "../models/userModel.js";

// Default first account — created automatically only when the Users table is empty.
// Change the password after your first login.
const DEFAULT_ADMIN = { name: "HR Administrator", email: "admin@aquapiol.com", password: "admin123" };

let seeded = false;
async function ensureDefaultAdmin() {
  if (seeded) return;
  if ((await User.count()) === 0) {
    await User.create({ ...DEFAULT_ADMIN, password: await bcrypt.hash(DEFAULT_ADMIN.password, 10) });
    console.log(`👤 Default login created → ${DEFAULT_ADMIN.email} / ${DEFAULT_ADMIN.password}`);
  }
  seeded = true;
}

// Very small in-memory throttle: 5 failed attempts / 10 minutes per IP + email.
const attempts = new Map();
const WINDOW_MS = 10 * 60 * 1000, MAX_FAILS = 5;
const keyOf = (req, email) => `${req.ip}|${email}`;
const isLocked = (key) => {
  const a = attempts.get(key);
  if (!a) return false;
  if (Date.now() - a.first > WINDOW_MS) { attempts.delete(key); return false; }
  return a.count >= MAX_FAILS;
};
const addFail = (key) => {
  const a = attempts.get(key);
  if (!a || Date.now() - a.first > WINDOW_MS) attempts.set(key, { count: 1, first: Date.now() });
  else a.count++;
};

export const showLogin = async (req, res) => {
  try { await ensureDefaultAdmin(); } catch (e) { console.error("Login setup error:", e.message); res.locals.error_msg = ["Cannot reach the database. Start MySQL (XAMPP) and run: npm run migrate"]; }
  const email = req.session.lastEmail || "";
  delete req.session.lastEmail;
  res.render("login", {
    title: "Sign in",
    loggedOut: req.query.loggedout === "1",
    email
  });
};

export const login = async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const fail = (msg) => { req.session.lastEmail = email; req.flash("error_msg", msg); return res.redirect("/login"); };

  if (!email || !password) return fail("Please enter your email and password.");
  const key = keyOf(req, email);
  if (isLocked(key)) return fail("Too many failed attempts. Please wait 10 minutes and try again.");

  try {
    await ensureDefaultAdmin();
    const user = await User.findOne({ where: { email } });
    const ok = user ? await bcrypt.compare(password, user.password) : false;
    if (!ok) { addFail(key); return fail("Incorrect email or password."); }

    attempts.delete(key);
    const returnTo = req.session.returnTo;
    // New session id after login (prevents session fixation).
    req.session.regenerate((err) => {
      if (err) { console.error(err); return fail("Could not start your session. Please try again."); }
      req.session.user = { id: user.id, name: user.name, email: user.email };
      req.session.save(() => res.redirect(returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/hr"));
    });
  } catch (e) {
    console.error("Login error:", e.message);
    return fail("Login failed. Check that MySQL is running and the database is migrated.");
  }
};

export const logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.redirect("/login?loggedout=1");
  });
};

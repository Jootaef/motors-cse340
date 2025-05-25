/*******************************************
 * Main server configuration file
 * Initializes and starts the Express app
 *******************************************/

/* ===== Module Imports ===== */
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
require("dotenv").config();
const session = require("express-session");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const pgSession = require("connect-pg-simple")(session);

/* ===== App & Modules Setup ===== */
const app = express();
const db = require("./database/");
const utils = require("./utilities/");
const staticRoutes = require("./routes/static");
const inventoryRoutes = require("./routes/inventoryRoute");
const accountRoutes = require("./routes/accountRoute");
const reviewRoutes = require("./routes/reviewRoute");
const homeController = require("./controllers/baseController");

/* ===== View Engine Config ===== */
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

/* ===== Session & Middleware ===== */
app.use(
  session({
    store: new pgSession({
      pool: db,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || "superSecret123",
    resave: false,
    saveUninitialized: true,
    name: "sessionId",
  })
);

app.use(cookieParser());
app.use(flash());

app.use((req, res, next) => {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(utils.checkJWTToken);

/* ===== Routes Setup ===== */
app.use(staticRoutes);
app.get("/", utils.handleErrors(homeController.buildHome));
app.use("/inv", inventoryRoutes);
app.use("/account", accountRoutes);
app.use("/reviews", reviewRoutes);

/* ===== 404 Handler ===== */
app.use((req, res, next) => {
  next({ status: 404, message: "Página no encontrada." });
});

/* ===== Error Handler ===== */
app.use(async (err, req, res, next) => {
  const nav = await utils.getNav();
  const status = err.status || 500;
  const message =
    status === 404
      ? err.message
      : `Error ${status}: Algo salió mal en el servidor.`;

  res.status(status).render("errors/error", {
    title: `Error ${status}`,
    message,
    nav,
  });
});

/* ===== Server Start ===== */
const port = process.env.PORT || 3000;
const host = process.env.HOST || "localhost";

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor en funcionamiento en http://0.0.0.0:${PORT}`);
});



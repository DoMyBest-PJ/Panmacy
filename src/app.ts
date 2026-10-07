import express from "express";
import session from "express-session";
import path from "path";
import {homepage , login , forum , cart , profile , orders , admin , pharmacist_signup , pharmacy_dashboard} from "./controllers/controll"

const app = express();
const PORT = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: "mysecret",
    resave: false,
    saveUninitialized: true,
  }),
);

app.use((req, res, next) => {
    res.locals.activePage = null;
    next();
});

// หน้าแรก
app.get("/",homepage);

app.get("/admin",admin);

app.get("/login",login);

app.get("/forum",forum);

app.get("/cart",cart);

app.get("/profile",profile);

app.get("/orders",orders);

app.get("/pharmacist-signup",pharmacist_signup);

app.get("/pharmacy-dashboard",pharmacy_dashboard);

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
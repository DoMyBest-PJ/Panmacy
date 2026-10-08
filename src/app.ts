import express from "express";
import session from "express-session";
import path from "path";
import {homepage , login , forum , cart , profile , orders , admin , pharmacist_signup , pharmacy_dashboard , createUser} from "./controllers/controll"
import {Connection_status} from "./models/db";

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

Connection_status();  // ใช้ run function ใน db.ts เฉยๆใช้ตรงนี้เเล้วดูรกๆ

app.get("/",homepage);

app.get("/admin",admin);

app.get("/login",login);

app.get("/forum",forum);

app.get("/cart",cart);

app.get("/profile",profile);

app.get("/orders",orders);

app.get("/pharmacist-signup",pharmacist_signup);

app.get("/pharmacy-dashboard",pharmacy_dashboard);

app.post("/users", createUser);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
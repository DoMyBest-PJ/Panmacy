import express from "express";
import session from "express-session";
import path from "path";
import {homepage , login , forum , cart , profile , orders , admin , pharmacist_signup , pharmacy_dashboard , loginUser} from "./controllers/controll"
import {Connection_status} from "./models/db";

const app = express();
const PORT = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(  //session data
  session({
    secret: "mysecret",
    resave: false,
    saveUninitialized: true,
  }),
);

declare module "express-session" {  // session value
  interface SessionData {
    userID?: number;
    userType?: "Customer" | "Seller";
    tempMsg?: string;
  }
}

app.use((req, res, next) => { // ตัวแปรถาวร
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

app.post("/user-login", loginUser);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
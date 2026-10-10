import express from "express";
import session from "express-session";
import path from "path";
import {homepage ,pharmacy_signup,signout,signupUser, login , forum , cart , profile , orders , admin , pharmacist_signup , pharmacy_dashboard , loginUser ,signup} from "./controllers/controll"
import {db,Connection_status} from "./models/db";

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
    userType?: "CUSTOMER" | "PHARMACIST";
    tempMsg?: string;
  }
}

app.use(async (req, res, next) => { //  ตัวแปรถาวร + ทำงานทุกครั้งที่เปลี่ยน route
  try {
    res.locals.activePage = undefined;
    res.locals.username = undefined;
    res.locals.user_Email = undefined;
    res.locals.userID = req.session.userID;
    res.locals.userType = req.session.userType;
    res.locals.isLogin = !!req.session.userID;

    if (req.session.userID) {
      const [rows]: any = await db.execute(
        "SELECT Username,Email FROM `user` WHERE UserID = ?",
        [req.session.userID]
      );
      const [rows2]: any = await db.execute(
        "SELECT CustomerName FROM `customer` WHERE UserID = ?",
        [req.session.userID]
      );

      if (rows.length > 0) {
        res.locals.username = rows[0].Username;
        if(rows2[0].CustomerName != "Anonymous"){
          res.locals.username = rows2[0].CustomerName;
        }
      }
      if (rows.length > 0) {
        res.locals.user_Email = rows[0].Email;
      }
    }

    next();
  } catch (err) {
    next(err);
  }
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

app.post("/pharmacy-signup", pharmacy_signup);

app.post("/user-login", loginUser);

app.get("/signup" , signup);

app.post("/sign-up",signupUser);

app.get("/signout",signout);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
import express from "express";
import session from "express-session";
import path from "path";
import {homepage , login} from "./controllers/controll"

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

// หน้าแรก
app.get("/",homepage);

app.get("/login",login);

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
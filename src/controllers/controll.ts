import { Request, Response } from "express";
import { db } from "../models/db";

export async function homepage(req: Request, res: Response) {
  console.log("UserID: ", req.session.userID);
  console.log("UserType: ", req.session.userType);
  console.log("TempMsg: ", req.session.tempMsg);
  console.log("Username: ", res.locals.username);

  res.render("index", { activePage: 1 });
}

export function forum(req: Request, res: Response) {
  res.render("forum", { activePage: 2 });
}

export function login(req: Request, res: Response) {
  const msg = req.session.tempMsg;
  req.session.tempMsg = undefined;
  res.render("login", { msg });
}

export function cart(req: Request, res: Response) {
  res.render("cart");
}

export function profile(req: Request, res: Response) {
  res.render("profile");
}

export function orders(req: Request, res: Response) {
  res.render("orders");
}

export function admin(req: Request, res: Response) {
  res.render("admin/admin");
}

export function pharmacist_signup(req: Request, res: Response) {
  res.render("pharmacist-signup");
}

export function pharmacy_dashboard(req: Request, res: Response) {
  res.render("pharmacy-dashboard");
}

export async function loginUser(req: Request, res: Response) {
  const { email, password } = req.body;
  const [rows]: any = await db.execute(
    "SELECT UserID,Email,Password,Role FROM user WHERE Email = ?; ",
    [email],
  );

  if (rows.length === 0 || password != rows[0].Password) {
    req.session.tempMsg = "Invaild Email or Password.";
    return res.redirect("/login");
  }

  req.session.userID = rows[0].UserID;
  req.session.userType = rows[0].Role;

  return res.redirect("/");
}

export function signup(req: Request, res: Response) {
  const msg = req.session.tempMsg;
  req.session.tempMsg = undefined;
  res.render("signup", { msg });
}

export async function signupUser(req: Request, res: Response) {
  try {
    const { username, email, password, repassword } = req.body;

    const [rows]: any = await db.execute("SELECT Username,Email FROM user WHERE Email = ?", [
      email,
    ]);

    if (rows.length > 0) {
      if (rows[0].Username === username) {
        req.session.tempMsg = "Username already exists.";
        return res.redirect("/signup");
      }
      req.session.tempMsg = "Email already exists.";
      return res.redirect("/signup");
    }

    await db.execute(
      "INSERT INTO user (Username, Email, Password, Role, CreatedDate) VALUES (?, ?, ?, ?, NOW())",
      [username, email, password, "CUSTOMER"],
    );

    const [user]: any = await db.execute("SELECT * FROM user WHERE Email = ?", [
      email,
    ]);

    await db.execute(
      "INSERT INTO customer(UserID,CustomerName) VALUES (?,?);",
      [user[0].UserID, "Anonymous"],
    );

    return res.redirect("/login");
  } catch (e) {
    console.log(e);
    req.session.tempMsg = "Something went wrong.";
    return res.redirect("/signup");
  }
}

export function signout(req: Request, res: Response) {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Sign out failed");
    }
    res.redirect("/");
  });
}

export function pharmacy_signup(req:Request , res:Response){
  try{
    const [Pharmacy_name , Pharmacist_name , email , phone , address] = req.body;


  }catch(e){
    console.log(e);
    req.session.tempMsg = "Something went wrong.";
    return res.redirect("/pharmacist-signup");
  }
}

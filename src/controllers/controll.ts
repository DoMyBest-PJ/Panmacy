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
  const msg = req.session.tempMsg;
  req.session.tempMsg = undefined;
  res.render("pharmacist-signup",{msg});
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
  const con = await db.getConnection();
  try {
    const { username, email, password, repassword } = req.body;
    con.beginTransaction();

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

    await con.execute(
      "INSERT INTO user (Username, Email, Password, Role, CreatedDate) VALUES (?, ?, ?, ?, NOW())",
      [username, email, password, "CUSTOMER"],
    );

    const [user]: any = await db.execute("SELECT * FROM user WHERE Email = ?", [
      email,
    ]);

    await con.execute(
      "INSERT INTO customer(UserID,CustomerName) VALUES (?,?);",
      [user[0].UserID, "Anonymous"],
    );

    await con.commit();
    return res.redirect("/login");

  } catch (e) {

    await con.rollback();
    console.log(e);
    req.session.tempMsg = "Something went wrong.";
    return res.redirect("/signup");

  }finally{
    con.release();
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

export async function pharmacy_signup(req:Request , res:Response){
  const con = await db.getConnection();
  try{
    const {Pharmacy_name , Pharmacist_name, phone , address , license_number} = req.body;
    con.beginTransaction();

    await con.execute(
      "INSERT INTO pharmacist(UserID,PharmacistName, LicenseNumber, Phone) VALUES (?,?,?,?);",
      [res.locals.userID, Pharmacist_name , license_number , null]
    );
    await con.execute(
      "INSERT INTO pharmacy(PharmacistID, PharmacyName, Address, ContactNumber, Description) VALUES (?,?,?,?,NULL);",
      [res.locals.userID, Pharmacy_name , address , phone]
    );
    await con.execute(
      "DELETE FROM customer WHERE UserID = ?",
      [res.locals.userID]
    )
    await con.execute(
      "UPDATE user SET role = 'PHARMACIST' WHERE UserID = ?",
      [res.locals.userID]
    )

    await con.commit();
    return res.redirect('/');

  }catch(e){

    await con.rollback();
    console.log(e);
    req.session.tempMsg = "Something went wrong.";
    return res.redirect("/pharmacist-signup");

  }finally{
    con.release();
  }
}

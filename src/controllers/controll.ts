import { Request, Response } from "express";
import { db } from "../models/db";

export async function homepage(req: Request, res: Response) {
  if (req.session.userType === "PHARMACIST") {
    return res.redirect("pharmacy-dashboard");
  }
  const [rows]:any = await db.execute(
    "SELECT pp.PharmacyProductID, pc.PharmacyName, pp.ProductName, pp.Description, pp.Quantity, pp.Price, pp.Category FROM pharmacy pc INNER JOIN pharmacyproduct pp ON pc.PharmacyID = pp.PharmacyID",
    []
  );

  res.render("index", { activePage: 1, rows });
}

export async function forum(req: Request, res: Response) {
  const [threads]:any = await db.execute(
    "SELECT ft.UserID, u.Role, ft.ThreadID, ft.Title, ft.Description, ft.CreatedDate, COUNT(c.CommentID) AS CommentCount FROM forumthread ft LEFT JOIN Comment c ON ft.ThreadID = c.ThreadID JOIN user u ON u.UserID = ft.UserID GROUP BY ft.UserID, u.Role, ft.ThreadID, ft.Title, ft.Description, ft.CreatedDate ORDER BY ft.CreatedDate DESC;",
  );

  const name = [];
  for (const t of threads) {
    if(t.Role == "CUSTOMER"){
      const [username]:any = await db.execute("SELECT CustomerName FROM customer WHERE UserID = ?",[t.UserID]);
      name.push(username[0].CustomerName);
    }else if(t.Role == "PHARMACIST"){
      const [username]:any = await db.execute("SELECT PharmacistName FROM pharmacist WHERE UserID = ?",[t.UserID]);
      name.push(username[0].PharmacistName);
    }
  }

  const [topic]:any = await db.execute("SELECT ft.ThreadID, ft.Title, COUNT(c.CommentID) AS CommentCount FROM forumthread ft LEFT JOIN comment c ON ft.ThreadID = c.ThreadID GROUP BY ft.ThreadID, ft.Title ORDER BY CommentCount DESC LIMIT 4;");

  res.render("forum", { activePage: 2 , threads , name , topic});
}

export function login(req: Request, res: Response) {
  const msg = req.session.tempMsg;
  req.session.tempMsg = undefined;
  res.render("login", { msg });
}

export function cart(req: Request, res: Response) {
  res.render("cart");
}

export async function profile(req: Request, res: Response) {
  const [rows]: any = await db.execute(
    "SELECT * FROM user u JOIN customer c ON u.UserID = c.UserID WHERE u.UserID = ?",
    [res.locals.userID],
  );
  const msg = req.session.tempMsg;
  req.session.tempMsg = undefined;

  res.render("profile", {
    name: rows[0].CustomerName,
    email: rows[0].Email,
    password: rows[0].Password,
    phone: rows[0].Phone,
    address: rows[0].Address,
    msg,
  });
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
  res.render("pharmacist-signup", { msg });
}

export async function pharmacy_dashboard(req: Request, res: Response) {
  const [rows]: any = await db.execute(
    "SELECT * FROM pharmacy cy INNER JOIN pharmacist cist ON cy.PharmacistID = cist.UserID WHERE PharmacistID = ?;",
    [res.locals.userID],
  );
  res.render("pharmacy-dashboard", { pharname: rows[0].PharmacyName });
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

    const [rows]: any = await db.execute(
      "SELECT Username,Email FROM user WHERE Email = ?",
      [email],
    );

    if (rows.length > 0) {
      if (rows[0].Username === username) {
        req.session.tempMsg = "Username already exists.";
        return res.redirect("/signup");
      }
      req.session.tempMsg = "Email already exists.";
      return res.redirect("/signup");
    }

    await db.execute(
      "INSERT INTO user (Username, Email, Password, Role, CreatedDate) VALUES (?, ?, ?, 'CUSTOMER', NOW())",
      [username, email, password],
    );

    const [user]: any = await db.execute("SELECT * FROM user WHERE Email = ?", [
      email,
    ]);

    await db.execute(
      "INSERT INTO customer(UserID,CustomerName) VALUES (?,'Anonymous')",
      [user[0].UserID],
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

export async function pharmacy_signup(req: Request, res: Response) {
  try {
    const { Pharmacy_name, Pharmacist_name, phone, address, license_number } =
      req.body;

    const [rows]: any = await db.execute(
      "SELECT LicenseNumber FROM Pharmacist",
    );

    if (rows[0].LicenseNumber === license_number) {
      req.session.tempMsg = "LicenseNumber already exists.";
      return res.redirect("/pharmacist-signup");
    }

    await db.execute(
      "INSERT INTO pharmacist(UserID,PharmacistName, LicenseNumber, Phone) VALUES (?,?,?,?);",
      [res.locals.userID, Pharmacist_name, license_number, null],
    );
    await db.execute(
      "INSERT INTO pharmacy(PharmacistID, PharmacyName, Address, ContactNumber, Description) VALUES (?,?,?,?,NULL);",
      [res.locals.userID, Pharmacy_name, address, phone],
    );
    await db.execute("DELETE FROM customer WHERE UserID = ?", [
      res.locals.userID,
    ]);
    await db.execute("UPDATE user SET role = 'PHARMACIST' WHERE UserID = ?", [
      res.locals.userID,
    ]);

    req.session.userType = "PHARMACIST";
    return res.redirect("/");
  } catch (e) {
    console.log(e);
    req.session.tempMsg = "Something went wrong.";
    return res.redirect("/pharmacist-signup");
  }
}

export async function profile_change(req: Request, res: Response) {
  try {
    const { name, email,password, phone, address } = req.body;
    const userID = req.session.userID;

    await db.execute("UPDATE user SET Email = ? , Password = ? WHERE UserID = ?", [
      email,
      password,
      userID,
    ]);

    await db.execute(
      `UPDATE customer
       SET CustomerName = ?, Phone = ?, Address = ?
       WHERE UserID = ?`,
      [name, phone, address, userID],
    );

    req.session.tempMsg = "Successfully changed";
    return res.redirect("/profile");
  } catch (e) {
    console.log(e);
    req.session.tempMsg = "Something went wrong.";
    return res.redirect("/pharmacist-signup");
  }
}

export async function create_thread(req: Request, res: Response) {
  const {title, body} = req.body;
  await db.execute(
    "INSERT INTO forumthread(UserID , Title , Description , CreatedDate) VALUES( ?, ?, ?, NOW())",
    [req.session.userID,title,body]
  );
  return res.redirect("/forum");
}

export async function createComment(req:Request , res:Response) {
  const ThreadID = req.params.threadID;
  const { content } = req.body;

  await db.execute(
    "INSERT INTO comment(ThreadID , UserID , Content , CreatedDate) VALUES(?, ?, ?, NOW())",
    [ThreadID , req.session.userID , content]
  );

  console.log(ThreadID , content);
  res.redirect(`/forum/${ThreadID}`);
}
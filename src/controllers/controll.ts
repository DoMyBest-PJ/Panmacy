import {Request , Response} from "express";
import { db } from "../models/db";

export async function homepage(req:Request, res:Response){
    const [rows] = await db.execute("SELECT * FROM customer");
    console.log("Start Home Page Send user row : ",rows);
    console.log(req.session.userID);
    console.log(req.session.userType);
    console.log(req.session.tempMsg);
    req.session.tempMsg = "";
    res.render("index",{activePage:1});
}

export function forum(req:Request, res:Response){
    res.render("forum",{activePage:2});
}

export function login(req:Request, res:Response){
    res.render("login",{msg : req.session.tempMsg});
}

export function cart(req:Request, res:Response){
    res.render("cart");
}

export function profile(req:Request,res:Response){
    res.render("profile");
}

export function orders(req:Request,res:Response){
    res.render("orders");
}

export function admin(req:Request , res:Response){
    res.render("admin/admin");
}

export function pharmacist_signup(req:Request , res:Response){
    res.render("pharmacist-signup");
}

export function pharmacy_dashboard(req:Request , res:Response){
    res.render("pharmacy-dashboard")
}

export async function loginUser(req: Request, res: Response) {
    try{
        const { email, password } = req.body;
        const [rows]:any = await db.execute("SELECT cid,email,password FROM customer WHERE email = ?",
            [email]
        );

        if (rows.length === 0 || password != rows[2]) {
            req.session.tempMsg = "Invaild Email or Password.";
        }

        req.session.userID = rows[0].cid;
        req.session.userType = "Customer";

        return res.redirect("/");
    }catch(e){
        return res.redirect("/login");
    }
}

    
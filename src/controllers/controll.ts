import {Request , Response} from "express";
import { db } from "../models/db";

export async function homepage(req:Request, res:Response){
    const [rows] = await db.query("SELECT * FROM customer");
    console.log("Start Home Page Send user row : ",rows)
    res.render("index",{activePage:1});
}

export function forum(req:Request, res:Response){
    res.render("forum",{activePage:2});
}

export function login(req:Request, res:Response){
    res.render("login");
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

export async function createUser(req: Request, res: Response) {
    const { name, email } = req.body;

    await db.query(
        "INSERT INTO customer (name, email) VALUES (?, ?)",
        [name, email]
    );
    res.redirect("/");
}
import { Router, Request, Response } from "express";
import { db } from "../models/db";

const router = Router();

router.get("/:id", async (req: Request, res: Response) => {
    res.render("product");
});

export default router;
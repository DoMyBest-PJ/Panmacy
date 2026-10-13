import { Router, Request, Response } from "express";
import { db } from "../models/db";

const router = Router();

router.get("/:id", async (req: Request, res: Response) => {
    const proID = Number(req.params.id);

    if (!Number.isInteger(proID) || proID <= 0) {
        return res.status(400).send("Invalid product ID");
    }

    try {
        const [rows]: any = await db.execute(
            `SELECT
                pm.PharmacyName,
                pp.ProductName,
                pp.Description,
                pp.Quantity,
                pp.Price,
                pp.Category
             FROM pharmacy pm
             JOIN pharmacyproduct pp
                ON pm.PharmacyID = pp.PharmacyID
             WHERE pp.PharmacyProductID = ?`,
            [proID]
        );

        if (rows.length === 0) {
            return res.status(404).send("Product not found");
        }

        return res.render("product", { product: rows[0] });

    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
});

export default router;
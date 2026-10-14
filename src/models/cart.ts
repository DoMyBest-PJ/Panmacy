import { Router } from "express";
import {
    addToCart,
    removeCartItem,
    updateCartItem
} from "../controllers/controll";

const router = Router();

router.post("/add", addToCart); //เพิ่ม
router.patch("/item/:id", updateCartItem); //เปลี่ยน
router.delete("/item/:id", removeCartItem); //ลบ

export default router;
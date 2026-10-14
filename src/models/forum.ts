import { Router, Request, Response } from "express";
import { db } from "../models/db";

const router = Router();

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const threadID = Number(req.params.id);

    if (!Number.isInteger(threadID) || threadID <= 0) {
      return res.redirect("/forum");
    }

    const [forumOwner]: any = await db.execute(
      `SELECT
          u.Role,
          CASE
            WHEN u.Role = 'CUSTOMER' THEN c.CustomerName
            WHEN u.Role = 'PHARMACIST' THEN p.PharmacistName
          END AS OwnerName,
          ft.Title,
          ft.Description,
          ft.CreatedDate
       FROM forumthread ft
       INNER JOIN user u ON ft.UserID = u.UserID
       LEFT JOIN customer c ON u.UserID = c.UserID
       LEFT JOIN pharmacist p ON u.UserID = p.UserID
       WHERE ft.ThreadID = ?`,
      [threadID],
    );

    if (forumOwner.length === 0) {
      return res.redirect("/forum");
    }

    const [comment]: any = await db.execute(
      `SELECT
          c.Content,
          c.CreatedDate,
          c.UserID,
          u.Role,
          CASE
            WHEN u.Role = 'CUSTOMER' THEN ct.CustomerName
            WHEN u.Role = 'PHARMACIST' THEN p.PharmacistName
          END AS CommenterName
       FROM comment c
       INNER JOIN user u ON c.UserID = u.UserID
       LEFT JOIN customer ct ON u.UserID = ct.UserID
       LEFT JOIN pharmacist p ON u.UserID = p.UserID
       WHERE c.ThreadID = ?
       ORDER BY c.CreatedDate ASC`,
      [threadID],
    );

    return res.render("thread", {
      forumOwner: forumOwner[0],
      comment,
      threadID,
      activePage : 2
    });
  } catch (e) {
    console.log(e);
    return res.redirect("/forum");
  }
});

export default router;

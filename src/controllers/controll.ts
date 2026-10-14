import { Request, Response } from "express";
import { db } from "../models/db";

export async function homepage(req: Request, res: Response) {
  if (req.session.userType === "PHARMACIST") {
    return res.redirect("pharmacy-dashboard");
  }
  const [rows]: any = await db.execute(
    "SELECT pp.PharmacyProductID, pc.PharmacyName, pp.ProductName, pp.Description, pp.Quantity, pp.Price, pp.Category FROM pharmacy pc INNER JOIN pharmacyproduct pp ON pc.PharmacyID = pp.PharmacyID",
    [],
  );

  res.render("index", { activePage: 1, rows });
}

export async function forum(req: Request, res: Response) {
  const [threads]: any = await db.execute(
    "SELECT ft.UserID, u.Role, ft.ThreadID, ft.Title, ft.Description, ft.CreatedDate, COUNT(c.CommentID) AS CommentCount FROM forumthread ft LEFT JOIN Comment c ON ft.ThreadID = c.ThreadID JOIN user u ON u.UserID = ft.UserID GROUP BY ft.UserID, u.Role, ft.ThreadID, ft.Title, ft.Description, ft.CreatedDate ORDER BY ft.CreatedDate DESC;",
  );

  const name = [];
  for (const t of threads) {
    if (t.Role == "CUSTOMER") {
      const [username]: any = await db.execute(
        "SELECT CustomerName FROM customer WHERE UserID = ?",
        [t.UserID],
      );
      name.push(username[0].CustomerName);
    } else if (t.Role == "PHARMACIST") {
      const [username]: any = await db.execute(
        "SELECT PharmacistName FROM pharmacist WHERE UserID = ?",
        [t.UserID],
      );
      name.push(username[0].PharmacistName);
    }
  }

  const [topic]: any = await db.execute(
    "SELECT ft.ThreadID, ft.Title, COUNT(c.CommentID) AS CommentCount FROM forumthread ft LEFT JOIN comment c ON ft.ThreadID = c.ThreadID GROUP BY ft.ThreadID, ft.Title ORDER BY CommentCount DESC LIMIT 4;",
  );

  res.render("forum", { activePage: 2, threads, name, topic });
}

export function login(req: Request, res: Response) {
  const msg = req.session.tempMsg;
  req.session.tempMsg = undefined;
  res.render("login", { msg });
}

export async function cart(req: Request, res: Response) {
  const userID = req.session.userID;

  if (!userID || req.session.userType !== "CUSTOMER") {
    return res.redirect("/login");
  }

  const msg = req.session.tempMsg;
  req.session.tempMsg = undefined;

  try {
    const [rows]: any = await db.execute(
      `SELECT
                sc.CartID,
                ci.CartItemID,
                ci.Quantity AS CartQuantity,
                pp.PharmacyProductID,
                pp.ProductName,
                pp.Description,
                pp.Price,
                pp.Quantity AS Stock,
                pp.Category,
                pm.PharmacyID,
                pm.PharmacyName,
                pm.Address AS PharmacyAddress
            FROM ShoppingCart sc
            JOIN CartItem ci
                ON sc.CartID = ci.CartID
            JOIN PharmacyProduct pp
                ON ci.PharmacyProductID = pp.PharmacyProductID
            JOIN Pharmacy pm
                ON pp.PharmacyID = pm.PharmacyID
            WHERE sc.CustomerID = ?
              AND sc.Status = 'ACTIVE'
            ORDER BY pm.PharmacyID, ci.CartItemID`,
      [userID],
    );

    // จัดกลุ่มสินค้าแยกตามร้านขายยา
    const pharmacyMap = new Map<number, any>();

    for (const item of rows) {
      if (!pharmacyMap.has(item.PharmacyID)) {
        pharmacyMap.set(item.PharmacyID, {
          PharmacyID: item.PharmacyID,
          PharmacyName: item.PharmacyName,
          PharmacyAddress: item.PharmacyAddress,
          items: [],
        });
      }

      pharmacyMap.get(item.PharmacyID).items.push(item);
    }

    const pharmacyGroups = Array.from(pharmacyMap.values());

    const subtotal = rows.reduce(
      (sum: number, item: any) =>
        sum + Number(item.Price) * Number(item.CartQuantity),
      0,
    );

    const deliveryFee = pharmacyMap.size * 20;

    res.render("cart", {
      pharmacyGroups,
      subtotal,
      deliveryFee,
      orderTotal: subtotal + deliveryFee,
      msg,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Unable to load shopping cart.");
  }
}

export async function profile(req: Request, res: Response) {
  const msg = req.session.tempMsg;
  req.session.tempMsg = undefined;

  if (res.locals.userType == "CUSTOMER") {
    const [rows]: any = await db.execute(
      "SELECT * FROM user u JOIN customer c ON u.UserID = c.UserID WHERE u.UserID = ?",
      [res.locals.userID],
    );

    return res.render("profile", {
      name: rows[0].CustomerName,
      email: rows[0].Email,
      password: rows[0].Password,
      phone: rows[0].Phone,
      address: rows[0].Address,
      msg,
    });

  } else if (res.locals.userType == "PHARMACIST") {
    const [rows]: any = await db.execute(
      "SELECT * FROM user u JOIN pharmacist p ON u.UserID = p.UserID WHERE u.UserID = ?",
      [res.locals.userID],
    );

    return res.render("profile_pharmacist", {
      name: rows[0].PharmacistName,
      email: rows[0].Email,
      password: rows[0].Password,
      phone: rows[0].Phone,
      LicenseNumber: rows[0].LicenseNumber,
      msg,
    });
  }
}

export async function orders(req: Request, res: Response) {
  try {
    const customerID = res.locals.userID;

    const [rows]: any = await db.execute(
      `SELECT
                o.OrderID ,
                DATE_FORMAT(o.OrderDate, '%d %b %Y') AS Date,
                GROUP_CONCAT(DISTINCT p.PharmacyName
                    SEPARATOR ', ') AS Pharmacy,
                GROUP_CONCAT(
                    CONCAT(pp.ProductName, ' × ', oi.Quantity)
                    SEPARATOR ', '
                ) AS Items,
                o.TotalAmount,
                o.Status
            FROM \`Order\` o
            LEFT JOIN OrderItem oi
                ON o.OrderID = oi.OrderID
            LEFT JOIN PharmacyProduct pp
                ON oi.PharmacyProductID = pp.PharmacyProductID
            LEFT JOIN Pharmacy p
                ON pp.PharmacyID = p.PharmacyID
            WHERE o.CustomerID = ?
            GROUP BY o.OrderID, o.OrderDate,
                     o.TotalAmount, o.Status
            ORDER BY o.OrderDate  `,
      [customerID],
    );

    res.render("orders", { orders: rows });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
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
  if (!req.session.userID || req.session.userType !== "PHARMACIST") {
    return res.redirect("/login");
  }

  try {
    const [shops]: any = await db.execute(
      `SELECT PharmacyID, PharmacyName, Address, ContactNumber, Description
       FROM pharmacy
       WHERE PharmacistID = ?`,
      [req.session.userID],
    );

    if (shops.length === 0) {
      return res.status(404).send("Pharmacy not found.");
    }

    const pharmacy = shops[0];
    const [products]: any = await db.execute(
      `SELECT PharmacyProductID, ProductName, Description, Quantity, Price, Category
       FROM pharmacyproduct
       WHERE PharmacyID = ?
       ORDER BY ProductName`,
      [pharmacy.PharmacyID],
    );

    const msg = req.session.tempMsg;
    req.session.tempMsg = undefined;
    const requestedTab = req.query.tab;
    const activeTab =
      requestedTab === "profile" || requestedTab === "products" || requestedTab === "orders"
        ? requestedTab
        : msg
          ? "products"
          : "dashboard";

    const [livestock]:any = await db.execute("SELECT SUM(Quantity) AS Amount FROM pharmacy pm INNER JOIN pharmacyproduct pp ON pm.PharmacyID = pp.PharmacyID WHERE pm.PharmacistID = ?",[req.session.userID]);
    const [lowstock]:any = await db.execute("SELECT COUNT(pp.Quantity) AS lowSt FROM pharmacy pm JOIN pharmacyproduct pp ON pm.PharmacyID = pp.PharmacyID WHERE pm.PharmacistID = ? AND pp.Quantity < 6;",[req.session.userID]);
    console.log(lowstock);
    return res.render("pharmacy-dashboard", {
      pharname: pharmacy.PharmacyName,
      pharmacy,
      products,
      msg,
      activeTab,
      live : livestock[0].Amount,
      lowS : lowstock[0].lowSt
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Unable to load pharmacy dashboard.");
  }
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

    await db.execute("DELETE FROM shoppingcart WHERE `shoppingcart`.`CartID` = ?", [res.locals.userID]);

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
    const { name, email, password, phone, address } = req.body;
    const userID = req.session.userID;

    await db.execute(
      "UPDATE user SET Email = ? , Password = ? WHERE UserID = ?",
      [email, password, userID],
    );

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
  const { title, body } = req.body;
  await db.execute(
    "INSERT INTO forumthread(UserID , Title , Description , CreatedDate) VALUES( ?, ?, ?, NOW())",
    [req.session.userID, title, body],
  );
  return res.redirect("/forum");
}

export async function createComment(req: Request, res: Response) {
  const ThreadID = req.params.threadID;
  const { content } = req.body;

  await db.execute(
    "INSERT INTO comment(ThreadID , UserID , Content , CreatedDate) VALUES(?, ?, ?, NOW())",
    [ThreadID, req.session.userID, content],
  );

  console.log(ThreadID, content);
  res.redirect(`/forum/${ThreadID}`);
}

export async function payment_success(req: Request, res: Response) {
  const userID = req.session.userID;
  const orderID = Number(req.params.orderID);

  if (!userID || req.session.userType !== "CUSTOMER") {
    return res.redirect("/login");
  }
  if (!Number.isSafeInteger(orderID) || orderID <= 0) {
    return res.status(400).send("Invalid order ID.");
  }

  try {
    const [orders]: any = await db.execute(
      `SELECT
                o.OrderID,
                o.OrderDate,
                o.TotalAmount,
                COALESCE(SUM(oi.Quantity * oi.UnitPrice), 0) AS ItemsTotal,
                COUNT(DISTINCT p.PharmacyID) AS PharmacyCount
             FROM \`Order\` o
             LEFT JOIN OrderItem oi ON oi.OrderID = o.OrderID
             LEFT JOIN PharmacyProduct pp ON pp.PharmacyProductID = oi.PharmacyProductID
             LEFT JOIN Pharmacy p ON p.PharmacyID = pp.PharmacyID
             WHERE o.OrderID = ?
               AND o.CustomerID = ?
             GROUP BY o.OrderID, o.OrderDate, o.TotalAmount`,
      [orderID, userID],
    );

    if (orders.length === 0) {
      return res.status(404).send("Order not found.");
    }

    const order = orders[0];
    order.deliveryFee = Number(order.PharmacyCount) * 20;
    order.totalPaid = Number(order.ItemsTotal) + order.deliveryFee;

    return res.render("payment-success", { order });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Unable to load order confirmation.");
  }
}

export async function checkout(req: Request, res: Response) {
  const userID = req.session.userID;
  if (!userID || req.session.userType !== "CUSTOMER") {
    return res.redirect("/login");
  }

  const con = await db.getConnection();
  try {
    await con.beginTransaction();

    const [carts]: any = await con.execute(
      `SELECT CartID
             FROM ShoppingCart
             WHERE CustomerID = ?
               AND Status = 'ACTIVE'
             FOR UPDATE`,
      [userID],
    );

    if (carts.length === 0) {
      await con.rollback();
      req.session.tempMsg = "Your cart is empty.";
      return res.redirect("/cart");
    }

    const cartID = Number(carts[0].CartID);
    const [items]: any = await con.execute(
      `SELECT
                ci.PharmacyProductID,
                ci.Quantity,
                pp.ProductName,
                pp.Quantity AS Stock,
                pp.Price,
                pp.PharmacyID
             FROM CartItem ci
             JOIN PharmacyProduct pp
               ON pp.PharmacyProductID = ci.PharmacyProductID
             WHERE ci.CartID = ?
             FOR UPDATE`,
      [cartID],
    );

    if (items.length === 0) {
      await con.rollback();
      req.session.tempMsg = "Your cart is empty.";
      return res.redirect("/cart");
    }

    const outOfStock = items.find(
      (item: any) => Number(item.Quantity) > Number(item.Stock),
    );
    if (outOfStock) {
      await con.rollback();
      req.session.tempMsg = `Not enough stock for ${outOfStock.ProductName}. Please update your cart.`;
      return res.redirect("/cart");
    }

    const itemTotal = Number(
      items
        .reduce(
          (sum: number, item: any) =>
            sum + Number(item.Quantity) * Number(item.Price),
          0,
        )
        .toFixed(2),
    );

    const [orderResult]: any = await con.execute(
      `INSERT INTO \`Order\` (CustomerID, CartID, TotalAmount, Status)
             VALUES (?, ?, ?, 'PENDING')`,
      [userID, cartID, itemTotal],
    );
    const orderID = Number(orderResult.insertId);

    for (const item of items) {
      const quantity = Number(item.Quantity);
      const [stockResult]: any = await con.execute(
        `UPDATE PharmacyProduct
                 SET Quantity = Quantity - ?
                 WHERE PharmacyProductID = ?
                   AND Quantity >= ?`,
        [quantity, item.PharmacyProductID, quantity],
      );
      if (stockResult.affectedRows !== 1) {
        throw new Error(
          `Stock changed during checkout for product ${item.PharmacyProductID}.`,
        );
      }

      await con.execute(
        `INSERT INTO OrderItem
                    (OrderID, PharmacyProductID, Quantity, UnitPrice)
                 VALUES (?, ?, ?, ?)`,
        [orderID, item.PharmacyProductID, quantity, item.Price],
      );
    }

    await con.execute("DELETE FROM CartItem WHERE CartID = ?", [cartID]);

    await con.commit();
    return res.redirect(`/payment-success/${orderID}`);
  } catch (error) {
    await con.rollback();
    console.error(error);
    req.session.tempMsg = "Unable to complete checkout. Please try again.";
    return res.redirect("/cart");
  } finally {
    con.release();
  }
}

async function getCartItemCount(connection: any, customerID: number) {
  const [rows]: any = await connection.execute(
    `SELECT COALESCE(SUM(ci.Quantity), 0) AS CartItemCount
         FROM ShoppingCart sc
         LEFT JOIN CartItem ci ON ci.CartID = sc.CartID
         WHERE sc.CustomerID = ?
           AND sc.Status = 'ACTIVE'`,
    [customerID],
  );

  return Number(rows[0].CartItemCount);
}

export async function addToCart(req: Request, res: Response) {
  const userID = req.session.userID;

  if (!userID || req.session.userType !== "CUSTOMER") {
    return res.status(401).json({
      success: false,
      message: "Please log in as a customer.",
    });
  }

  const productID = Number(req.body.productID);
  const quantity = Number(req.body.quantity ?? 1);

  if (!Number.isSafeInteger(productID) || productID <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID.",
    });
  }

  if (!Number.isSafeInteger(quantity) || quantity <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid quantity.",
    });
  }

  const con = await db.getConnection();

  try {
    await con.beginTransaction();

    // 1. Check product and lock its row while updating the cart
    const [products]: any = await con.execute(
      `SELECT PharmacyProductID, Quantity
             FROM PharmacyProduct
             WHERE PharmacyProductID = ?
             FOR UPDATE`,
      [productID],
    );

    if (products.length === 0) {
      await con.rollback();

      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const stock = Number(products[0].Quantity);

    if (stock <= 0) {
      await con.rollback();

      return res.status(400).json({
        success: false,
        message: "This product is out of stock.",
      });
    }

    // 2. Find the customer's active cart
    const [carts]: any = await con.execute(
      `SELECT CartID
             FROM ShoppingCart
             WHERE CustomerID = ?
               AND Status = 'ACTIVE'
             LIMIT 1
             FOR UPDATE`,
      [userID],
    );

    let cartID: number;

    if (carts.length > 0) {
      cartID = carts[0].CartID;
    } else {
      // 3. Create a cart if the customer does not have one
      const [cartResult]: any = await con.execute(
        `INSERT INTO ShoppingCart (CustomerID, Status)
                 VALUES (?, 'ACTIVE')`,
        [userID],
      );

      cartID = cartResult.insertId;
    }

    // 4. Check whether this product is already in the cart
    const [items]: any = await con.execute(
      `SELECT CartItemID, Quantity
             FROM CartItem
             WHERE CartID = ?
               AND PharmacyProductID = ?
             FOR UPDATE`,
      [cartID, productID],
    );

    if (items.length > 0) {
      const newQuantity = Number(items[0].Quantity) + quantity;

      if (newQuantity > stock) {
        await con.rollback();

        return res.status(400).json({
          success: false,
          message: "Not enough stock available.",
        });
      }

      await con.execute(
        `UPDATE CartItem
                 SET Quantity = ?
                 WHERE CartItemID = ?`,
        [newQuantity, items[0].CartItemID],
      );
    } else {
      await con.execute(
        `INSERT INTO CartItem
                    (CartID, PharmacyProductID, Quantity)
                 VALUES (?, ?, ?)`,
        [cartID, productID, quantity],
      );
    }

    const cartItemCount = await getCartItemCount(con, userID);
    await con.commit();

    return res.json({
      success: true,
      message: "Added to cart successfully.",
      cartItemCount,
    });
  } catch (error) {
    await con.rollback();
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Unable to add product to cart.",
    });
  } finally {
    con.release();
  }
}

export async function updateCartItem(req: Request, res: Response) {
  const userID = req.session.userID;
  if (!userID || req.session.userType !== "CUSTOMER") {
    return res.status(401).json({
      success: false,
      message: "Please log in as a customer.",
    });
  }

  const cartItemID = Number(req.params.id);
  const quantity = Number(req.body.quantity);
  if (
    !Number.isSafeInteger(cartItemID) ||
    cartItemID <= 0 ||
    !Number.isSafeInteger(quantity) ||
    quantity <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid cart item or quantity.",
    });
  }

  const con = await db.getConnection();
  try {
    await con.beginTransaction();
    const [items]: any = await con.execute(
      `SELECT ci.CartItemID, pp.Quantity AS Stock
             FROM CartItem ci
             JOIN ShoppingCart sc ON sc.CartID = ci.CartID
             JOIN PharmacyProduct pp ON pp.PharmacyProductID = ci.PharmacyProductID
             WHERE ci.CartItemID = ?
               AND sc.CustomerID = ?
               AND sc.Status = 'ACTIVE'
             FOR UPDATE`,
      [cartItemID, userID],
    );

    if (items.length === 0) {
      await con.rollback();
      return res.status(404).json({
        success: false,
        message: "Cart item not found.",
      });
    }

    if (quantity > Number(items[0].Stock)) {
      await con.rollback();
      return res.status(400).json({
        success: false,
        message: "Not enough stock available.",
      });
    }

    await con.execute("UPDATE CartItem SET Quantity = ? WHERE CartItemID = ?", [
      quantity,
      cartItemID,
    ]);
    const cartItemCount = await getCartItemCount(con, userID);
    await con.commit();

    return res.json({ success: true, cartItemCount });
  } catch (error) {
    await con.rollback();
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Unable to update cart item.",
    });
  } finally {
    con.release();
  }
}

export async function removeCartItem(req: Request, res: Response) {
  const userID = req.session.userID;
  if (!userID || req.session.userType !== "CUSTOMER") {
    return res.status(401).json({
      success: false,
      message: "Please log in as a customer.",
    });
  }

  const cartItemID = Number(req.params.id);
  if (!Number.isSafeInteger(cartItemID) || cartItemID <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid cart item ID.",
    });
  }

  const con = await db.getConnection();
  try {
    await con.beginTransaction();
    const [result]: any = await con.execute(
      `DELETE ci FROM CartItem ci
             JOIN ShoppingCart sc ON sc.CartID = ci.CartID
             WHERE ci.CartItemID = ?
               AND sc.CustomerID = ?
               AND sc.Status = 'ACTIVE'`,
      [cartItemID, userID],
    );

    if (result.affectedRows === 0) {
      await con.rollback();
      return res.status(404).json({
        success: false,
        message: "Cart item not found.",
      });
    }

    const cartItemCount = await getCartItemCount(con, userID);
    await con.commit();

    return res.json({ success: true, cartItemCount });
  } catch (error) {
    await con.rollback();
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Unable to remove cart item.",
    });
  } finally {
    con.release();
  }
}

export async function profile_pharmacist_change(req:Request , res:Response){
  try {
    const { name, email, password, phone, licenseNumber } = req.body;
    const userID = req.session.userID;

    await db.execute(
      "UPDATE user SET Email = ? , Password = ? WHERE UserID = ?",
      [email, password, userID],
    );

    await db.execute(
      `UPDATE pharmacist
       SET PharmacistName = ?, LicenseNumber = ?, Phone = ?
       WHERE UserID = ?`,
      [name, licenseNumber, phone, userID],
    );

    req.session.tempMsg = "Successfully changed";
    return res.redirect("/profile");
  } catch (e) {
    console.log(e);
    req.session.tempMsg = "Something went wrong.";
    return res.redirect("/pharmacist-signup");
  }
}

export async function pharmacy_update(req:Request , res:Response) {
    const userID = req.session.userID;
    if (!userID || req.session.userType !== "PHARMACIST") {
        return res.redirect("/login");
    }

    const {name , address , phone , Description} = req.body;

    try {
        await db.execute(
            `UPDATE pharmacy
             SET PharmacyName = ?, Address = ?, ContactNumber = ?, Description = ?
             WHERE PharmacistID = ?`,
            [name, address, phone, Description, userID]
        );

        req.session.tempMsg = "Shop profile updated successfully.";
        return res.redirect("/pharmacy-dashboard?tab=profile");
    } catch (error) {
        console.error(error);
        req.session.tempMsg = "Unable to update shop profile. Please try again.";
        return res.redirect("/pharmacy-dashboard?tab=profile");
    }
}

function parsePharmacyProduct(body: any) {
  const productname =
    typeof body.productname === "string" ? body.productname.trim() : "";
  const category =
    typeof body.category === "string" ? body.category.trim() : "";
  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  const price = Number(body.price);
  const quantity = Number(body.quantity);

  if (
    !productname ||
    !category ||
    body.price === undefined ||
    body.price === "" ||
    !Number.isFinite(price) ||
    price < 0 ||
    body.quantity === undefined ||
    body.quantity === "" ||
    !Number.isSafeInteger(quantity) ||
    quantity < 0
  ) {
    return null;
  }

  return { productname, price, quantity, category, description };
}

export async function pharmacy_add(req: Request, res: Response) {
  const userID = req.session.userID;
  if (!userID || req.session.userType !== "PHARMACIST") {
    return res.redirect("/login");
  }

  const product = parsePharmacyProduct(req.body);
  if (!product) {
    req.session.tempMsg = "Enter a product name, valid price, stock quantity, and category.";
    return res.redirect("/pharmacy-dashboard");
  }

  try {
    const [shops]: any = await db.execute(
      "SELECT PharmacyID FROM pharmacy WHERE PharmacistID = ?",
      [userID],
    );
    if (shops.length === 0) {
      return res.status(404).send("Pharmacy not found.");
    }

    await db.execute(
      `INSERT INTO pharmacyproduct
        (PharmacyID, ProductName, Description, Quantity, Price, Category)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        shops[0].PharmacyID,
        product.productname,
        product.description || null,
        product.quantity,
        product.price,
        product.category,
      ],
    );

    req.session.tempMsg = "Product added successfully.";
    return res.redirect("/pharmacy-dashboard");
  } catch (error) {
    console.error(error);
    req.session.tempMsg = "Unable to add the product. Please try again.";
    return res.redirect("/pharmacy-dashboard");
  }
}

export async function pharmacy_edit(req: Request, res: Response) {
  const userID = req.session.userID;
  if (!userID || req.session.userType !== "PHARMACIST") {
    return res.redirect("/login");
  }

  const productID = Number(req.params.productID);
  const product = parsePharmacyProduct(req.body);
  if (!Number.isSafeInteger(productID) || productID <= 0 || !product) {
    req.session.tempMsg = "Invalid product details.";
    return res.redirect("/pharmacy-dashboard");
  }

  try {
    const [ownedProducts]: any = await db.execute(
      `SELECT pp.PharmacyProductID
       FROM pharmacyproduct pp
       JOIN pharmacy p ON p.PharmacyID = pp.PharmacyID
       WHERE pp.PharmacyProductID = ?
         AND p.PharmacistID = ?`,
      [productID, userID],
    );
    if (ownedProducts.length === 0) {
      req.session.tempMsg = "Product not found in your pharmacy.";
      return res.redirect("/pharmacy-dashboard");
    }

    await db.execute(
      `UPDATE pharmacyproduct pp
       JOIN pharmacy p ON p.PharmacyID = pp.PharmacyID
       SET pp.ProductName = ?,
           pp.Description = ?,
           pp.Quantity = ?,
           pp.Price = ?,
           pp.Category = ?
       WHERE pp.PharmacyProductID = ?
         AND p.PharmacistID = ?`,
      [
        product.productname,
        product.description || null,
        product.quantity,
        product.price,
        product.category,
        productID,
        userID,
      ],
    );

    req.session.tempMsg = "Product updated successfully.";
    return res.redirect("/pharmacy-dashboard");
  } catch (error) {
    console.error(error);
    req.session.tempMsg = "Unable to update the product. Please try again.";
    return res.redirect("/pharmacy-dashboard");
  }
}

export async function pharmacy_delete(req: Request, res: Response) {
  const userID = req.session.userID;
  if (!userID || req.session.userType !== "PHARMACIST") {
    return res.redirect("/login");
  }

  const productID = Number(req.params.productID);
  if (!Number.isSafeInteger(productID) || productID <= 0) {
    req.session.tempMsg = "Invalid product.";
    return res.redirect("/pharmacy-dashboard");
  }

  try {
    const [result]: any = await db.execute(
      `DELETE pp FROM pharmacyproduct pp
       JOIN pharmacy p ON p.PharmacyID = pp.PharmacyID
       WHERE pp.PharmacyProductID = ?
         AND p.PharmacistID = ?`,
      [productID, userID],
    );

    if (result.affectedRows === 0) {
      req.session.tempMsg = "Product not found in your pharmacy.";
      return res.redirect("/pharmacy-dashboard");
    }

    req.session.tempMsg = "Product deleted successfully.";
    return res.redirect("/pharmacy-dashboard");
  } catch (error) {
    console.error(error);
    if ((error as { code?: string }).code === "ER_ROW_IS_REFERENCED_2") {
      req.session.tempMsg =
        "This product cannot be deleted because it is referenced by an existing cart or order.";
    } else {
      req.session.tempMsg = "Unable to delete the product. Please try again.";
    }
    return res.redirect("/pharmacy-dashboard");
  }
}
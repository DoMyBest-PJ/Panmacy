-- =====================================================================
-- PANMACY database (revised)
-- Requires MySQL 8.0.16+ (CHECK constraints are enforced from this version)
-- =====================================================================
CREATE DATABASE IF NOT EXISTS panmacy;
--     -- CHARACTER SET utf8mb4
--     -- COLLATE utf8mb4_unicode_ci;
USE panmacy;

-- ---------------------------------------------------------------------
-- 1. User (supertype)
--    Role = discriminator of the disjoint (d) specialization
--    Password must store a HASH (bcrypt/argon2), never plain text
-- ---------------------------------------------------------------------
CREATE TABLE `User` (
    UserID      INT AUTO_INCREMENT PRIMARY KEY,
    Username    VARCHAR(100) NOT NULL UNIQUE,
    Email       VARCHAR(255) NOT NULL UNIQUE,
    Password    VARCHAR(255) NOT NULL,
    Role        ENUM('CUSTOMER', 'PHARMACIST') NOT NULL,
    CreatedDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB;


-- ---------------------------------------------------------------------
-- 2. Customer (subtype of User)
-- ---------------------------------------------------------------------
CREATE TABLE Customer (
    UserID       INT PRIMARY KEY,
    CustomerName VARCHAR(150) NOT NULL,
    Phone        VARCHAR(30),
    Address      VARCHAR(500),

    CONSTRAINT fk_customer_user
        FOREIGN KEY (UserID)
        REFERENCES `User`(UserID)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE = InnoDB;


-- ---------------------------------------------------------------------
-- 3. Pharmacist (subtype of User)
-- ---------------------------------------------------------------------
CREATE TABLE Pharmacist (
    UserID        INT PRIMARY KEY,
    LicenseNumber VARCHAR(100) NOT NULL UNIQUE,
    Phone         VARCHAR(30),

    CONSTRAINT fk_pharmacist_user
        FOREIGN KEY (UserID)
        REFERENCES `User`(UserID)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE = InnoDB;


-- ---------------------------------------------------------------------
-- 4. Pharmacy   (Pharmacist 1 : 1 Pharmacy)
--    PharmacistID NOT NULL UNIQUE  -> one pharmacist owns exactly one pharmacy
-- ---------------------------------------------------------------------
CREATE TABLE Pharmacy (
    PharmacyID    INT AUTO_INCREMENT PRIMARY KEY,
    PharmacistID  INT NOT NULL UNIQUE,
    PharmacyName  VARCHAR(255) NOT NULL,
    Address       VARCHAR(500),
    ContactNumber VARCHAR(30),
    Description   TEXT,

    CONSTRAINT fk_pharmacy_pharmacist
        FOREIGN KEY (PharmacistID)
        REFERENCES Pharmacist(UserID)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE = InnoDB;


-- ---------------------------------------------------------------------
-- 5. Product
--    Category is an ATTRIBUTE of Product (as in the entity table),
--    so the separate Category table has been removed.
-- ---------------------------------------------------------------------
CREATE TABLE Product (
    ProductID   INT AUTO_INCREMENT PRIMARY KEY,
    ProductName VARCHAR(255) NOT NULL,
    Description TEXT,
    Category    VARCHAR(100) NOT NULL,

    INDEX idx_product_category (Category)
) ENGINE = InnoDB;


-- ---------------------------------------------------------------------
-- 6. PharmacyProduct   (Pharmacy 1:M PharmacyProduct, Product 1:M PharmacyProduct)
-- ---------------------------------------------------------------------
CREATE TABLE PharmacyProduct (
    PharmacyProductID INT AUTO_INCREMENT PRIMARY KEY,
    PharmacyID        INT NOT NULL,
    ProductID         INT NOT NULL,
    Quantity          INT NOT NULL DEFAULT 0,
    Price             DECIMAL(10, 2) NOT NULL,

    CONSTRAINT chk_pharmacy_product_quantity CHECK (Quantity >= 0),
    CONSTRAINT chk_pharmacy_product_price    CHECK (Price >= 0),

    -- one pharmacy can list the same product only once
    CONSTRAINT uq_pharmacy_product UNIQUE (PharmacyID, ProductID),

    CONSTRAINT fk_pharmacy_product_pharmacy
        FOREIGN KEY (PharmacyID)
        REFERENCES Pharmacy(PharmacyID)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_pharmacy_product_product
        FOREIGN KEY (ProductID)
        REFERENCES Product(ProductID)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE = InnoDB;


-- ---------------------------------------------------------------------
-- 7. ShoppingCart   (Customer 1 : 1 ShoppingCart)
--    UNIQUE (CartID, CustomerID) is needed so that `Order` can reference
--    a cart AND guarantee the cart belongs to the same customer.
-- ---------------------------------------------------------------------
CREATE TABLE ShoppingCart (
    CartID      INT AUTO_INCREMENT PRIMARY KEY,
    CustomerID  INT NOT NULL UNIQUE,
    CreatedDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Status      ENUM('ACTIVE', 'CHECKED_OUT', 'ABANDONED') NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT uq_cart_id_customer UNIQUE (CartID, CustomerID),

    CONSTRAINT fk_cart_customer
        FOREIGN KEY (CustomerID)
        REFERENCES Customer(UserID)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE = InnoDB;


-- ---------------------------------------------------------------------
-- 8. CartItem   (associative entity: ShoppingCart M:N PharmacyProduct)
--    Renamed from CustomerCart to match the ER diagram.
-- ---------------------------------------------------------------------
CREATE TABLE CartItem (
    CartItemID        INT AUTO_INCREMENT PRIMARY KEY,
    CartID            INT NOT NULL,
    PharmacyProductID INT NOT NULL,
    Quantity          INT NOT NULL DEFAULT 1,

    CONSTRAINT chk_cart_item_quantity CHECK (Quantity > 0),

    CONSTRAINT uq_cart_item UNIQUE (CartID, PharmacyProductID),

    CONSTRAINT fk_cart_item_cart
        FOREIGN KEY (CartID)
        REFERENCES ShoppingCart(CartID)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_cart_item_product
        FOREIGN KEY (PharmacyProductID)
        REFERENCES PharmacyProduct(PharmacyProductID)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE = InnoDB;


-- ---------------------------------------------------------------------
-- 9. Order   (Customer 1:M Order, ShoppingCart 1:M Order via "Checkout")
--    CartID is nullable (historical reference to the cart used at checkout).
--    The composite FK (CartID, CustomerID) guarantees that the cart
--    belongs to the same customer who placed the order.
--    TotalAmount is derived data = SUM(OrderItem.Quantity * UnitPrice);
--    it must be computed in the same transaction that creates the items.
-- ---------------------------------------------------------------------
CREATE TABLE `Order` (
    OrderID     INT AUTO_INCREMENT PRIMARY KEY,
    CustomerID  INT NOT NULL,
    CartID      INT NULL,
    OrderDate   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    TotalAmount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    Status      ENUM(
                    'PENDING',
                    'CONFIRMED',
                    'PROCESSING',
                    'SHIPPED',
                    'COMPLETED',
                    'CANCELLED'
                ) NOT NULL DEFAULT 'PENDING',

    CONSTRAINT chk_order_total CHECK (TotalAmount >= 0),

    CONSTRAINT fk_order_customer
        FOREIGN KEY (CustomerID)
        REFERENCES Customer(UserID)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_order_cart
        FOREIGN KEY (CartID, CustomerID)
        REFERENCES ShoppingCart(CartID, CustomerID)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE = InnoDB;


-- ---------------------------------------------------------------------
-- 10. OrderItem   (associative entity: Order M:N PharmacyProduct)
--     Renamed from ORDER_LIST to match the ER diagram.
--     UnitPrice = price SNAPSHOT at purchase time (must not follow later
--     changes of PharmacyProduct.Price).
-- ---------------------------------------------------------------------
CREATE TABLE OrderItem (
    OrderItemID       INT AUTO_INCREMENT PRIMARY KEY,
    OrderID           INT NOT NULL,
    PharmacyProductID INT NOT NULL,
    Quantity          INT NOT NULL,
    UnitPrice         DECIMAL(10, 2) NOT NULL,

    CONSTRAINT chk_order_item_quantity CHECK (Quantity > 0),
    CONSTRAINT chk_order_item_price    CHECK (UnitPrice >= 0),

    -- the same product cannot appear twice in the same order
    CONSTRAINT uq_order_item UNIQUE (OrderID, PharmacyProductID),

    CONSTRAINT fk_order_item_order
        FOREIGN KEY (OrderID)
        REFERENCES `Order`(OrderID)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_order_item_product
        FOREIGN KEY (PharmacyProductID)
        REFERENCES PharmacyProduct(PharmacyProductID)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE = InnoDB;


-- ---------------------------------------------------------------------
-- 11. ForumThread   (User 1:M ForumThread)
-- ---------------------------------------------------------------------
CREATE TABLE ForumThread (
    ThreadID    INT AUTO_INCREMENT PRIMARY KEY,
    UserID      INT NOT NULL,
    Title       VARCHAR(255) NOT NULL,
    Description TEXT NOT NULL,
    CreatedDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_thread_user
        FOREIGN KEY (UserID)
        REFERENCES `User`(UserID)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE = InnoDB;


-- ---------------------------------------------------------------------
-- 12. Comment   (ForumThread 1:M Comment, User 1:M Comment)
-- ---------------------------------------------------------------------
CREATE TABLE Comment (
    CommentID   INT AUTO_INCREMENT PRIMARY KEY,
    ThreadID    INT NOT NULL,
    UserID      INT NOT NULL,
    Content     TEXT NOT NULL,
    CreatedDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_comment_thread
        FOREIGN KEY (ThreadID)
        REFERENCES ForumThread(ThreadID)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_comment_user
        FOREIGN KEY (UserID)
        REFERENCES `User`(UserID)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE = InnoDB;


-- *** ignore below code ***


-- =====================================================================
-- Enforce the DISJOINT specialization (User -> Customer | Pharmacist)
-- A user must be inserted into the subtype table that matches User.Role,
-- so a user can never be both Customer and Pharmacist.
-- =====================================================================


-- DELIMITER $$

-- CREATE TRIGGER trg_customer_bi
-- BEFORE INSERT ON Customer
-- FOR EACH ROW
-- BEGIN
--     IF IFNULL((SELECT Role FROM `User` WHERE UserID = NEW.UserID), '') <> 'CUSTOMER' THEN
--         SIGNAL SQLSTATE '45000'
--             SET MESSAGE_TEXT = 'User.Role must be CUSTOMER to be inserted into Customer';
--     END IF;
-- END$$

-- CREATE TRIGGER trg_pharmacist_bi
-- BEFORE INSERT ON Pharmacist
-- FOR EACH ROW
-- BEGIN
--     IF IFNULL((SELECT Role FROM `User` WHERE UserID = NEW.UserID), '') <> 'PHARMACIST' THEN
--         SIGNAL SQLSTATE '45000'
--             SET MESSAGE_TEXT = 'User.Role must be PHARMACIST to be inserted into Pharmacist';
--     END IF;
-- END$$

-- -- Prevent changing Role after the subtype row already exists
-- CREATE TRIGGER trg_user_bu
-- BEFORE UPDATE ON `User`
-- FOR EACH ROW
-- BEGIN
--     IF NEW.Role <> OLD.Role AND (
--            EXISTS (SELECT 1 FROM Customer   WHERE UserID = OLD.UserID)
--         OR EXISTS (SELECT 1 FROM Pharmacist WHERE UserID = OLD.UserID)
--     ) THEN
--         SIGNAL SQLSTATE '45000'
--             SET MESSAGE_TEXT = 'Cannot change Role: subtype record already exists';
--     END IF;
-- END$$

-- DELIMITER ;
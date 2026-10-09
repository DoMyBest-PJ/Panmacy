-- =====================================================================
-- PANMACY : sample data in English (run AFTER panmacy.sql)
-- Insert order follows FK dependencies. All IDs are given explicitly
-- so every relationship below is traceable.
-- Passwords are DUMMY bcrypt-looking strings, not real hashes.
-- =====================================================================
-- SET NAMES utf8mb4;
USE panmacy;

START TRANSACTION;

-- ---------------------------------------------------------------------
-- 1. User (20 rows)  ID 1-12 = CUSTOMER, ID 13-20 = PHARMACIST
-- ---------------------------------------------------------------------
INSERT INTO `User` (UserID, Username, Email, Password, Role, CreatedDate) VALUES
(1,  'somchai_k',    'somchai.k@example.com',    '$2b$10$dummyhashdummyhashdummyhashdummyhashdummyhashdummyhas01', 'CUSTOMER',   '2026-01-10 09:00:00'),
(2,  'somying_r',    'somying.r@example.com',    '$2b$10$dummyhashdummyhashdummyhashdummyhashdummyhashdummyhas02', 'CUSTOMER',   '2026-01-12 10:15:00'),
(3,  'prasert_w',    'prasert.w@example.com',    '$2b$10$dummyhashdummyhashdummyhashdummyhashdummyhashdummyhas03', 'CUSTOMER',   '2026-01-15 11:30:00'),
(4,  'wipawadee_s',  'wipawadee.s@example.com',  '$2b$10$dummyhashdummyhashdummyhashdummyhashdummyhashdummyhas04', 'CUSTOMER',   '2026-01-20 14:00:00'),
(5,  'kittipong_s',  'kittipong.s@example.com',  '$2b$10$dummyhashdummyhashdummyhashdummyhashdummyhashdummyhas05', 'CUSTOMER',   '2026-02-01 08:45:00'),
(6,  'napaporn_k',   'napaporn.k@example.com',   '$2b$10$dummyhashdummyhashdummyhashdummyhashdummyhashdummyhas06', 'CUSTOMER',   '2026-02-05 16:20:00'),
(7,  'thanakorn_p',  'thanakorn.p@example.com',  '$2b$10$dummyhashdummyhashdummyhashdummyhashdummyhashdummyhas07', 'CUSTOMER',   '2026-02-10 13:10:00'),
(8,  'arunee_j',     'arunee.j@example.com',     '$2b$10$dummyhashdummyhashdummyhashdummyhashdummyhashdummyhas08', 'CUSTOMER',   '2026-02-18 09:55:00'),
(9,  'piyapong_m',   'piyapong.m@example.com',   '$2b$10$dummyhashdummyhashdummyhashdummyhashdummyhashdummyhas09', 'CUSTOMER',   '2026-02-25 17:40:00'),
(10, 'chonthicha_b', 'chonthicha.b@example.com', '$2b$10$dummyhashdummyhashdummyhashdummyhashdummyhashdummyhas10', 'CUSTOMER',   '2026-03-02 10:05:00'),
(11, 'phanupong_t',  'phanupong.t@example.com',  '$2b$10$dummyhashdummyhashdummyhashdummyhashdummyhashdummyhas11', 'CUSTOMER',   '2026-03-08 12:25:00'),
(12, 'supaporn_p',   'supaporn.p@example.com',   '$2b$10$dummyhashdummyhashdummyhashdummyhashdummyhashdummyhas12', 'CUSTOMER',   '2026-03-15 15:35:00'),
(13, 'pharm_nattaya',   'nattaya.ph@example.com',   '$2b$10$dummyhashdummyhashdummyhashdummyhashdummyhashdummyhas13', 'PHARMACIST', '2026-01-05 08:00:00'),
(14, 'pharm_wichai',    'wichai.ph@example.com',    '$2b$10$dummyhashdummyhashdummyhashdummyhashdummyhashdummyhas14', 'PHARMACIST', '2026-01-06 08:30:00'),
(15, 'pharm_kanya',     'kanya.ph@example.com',     '$2b$10$dummyhashdummyhashdummyhashdummyhashdummyhashdummyhas15', 'PHARMACIST', '2026-01-07 09:00:00'),
(16, 'pharm_anan',      'anan.ph@example.com',      '$2b$10$dummyhashdummyhashdummyhashdummyhashdummyhashdummyhas16', 'PHARMACIST', '2026-01-08 09:30:00'),
(17, 'pharm_siriporn',  'siriporn.ph@example.com',  '$2b$10$dummyhashdummyhashdummyhashdummyhashdummyhashdummyhas17', 'PHARMACIST', '2026-01-09 10:00:00'),
(18, 'pharm_thawat',    'thawat.ph@example.com',    '$2b$10$dummyhashdummyhashdummyhashdummyhashdummyhashdummyhas18', 'PHARMACIST', '2026-01-09 11:00:00'),
(19, 'pharm_pimchanok', 'pimchanok.ph@example.com', '$2b$10$dummyhashdummyhashdummyhashdummyhashdummyhashdummyhas19', 'PHARMACIST', '2026-01-10 08:15:00'),
(20, 'pharm_surasak',   'surasak.ph@example.com',   '$2b$10$dummyhashdummyhashdummyhashdummyhashdummyhashdummyhas20', 'PHARMACIST', '2026-01-11 08:45:00');


-- ---------------------------------------------------------------------
-- 2. Customer (12 rows) : UserID 1-12
-- ---------------------------------------------------------------------
INSERT INTO Customer (UserID, CustomerName, Phone, Address) VALUES
(1,  'Somchai Jaidee',      '081-234-5678', '123/4 Nimmanhaemin Rd, Suthep, Mueang, Chiang Mai 50200'),
(2,  'Somying Raksuk',      '082-345-6789', '55/12 Huay Kaew Rd, Suthep, Mueang, Chiang Mai 50200'),
(3,  'Prasert Wongthai',    '083-456-7890', '9 Chang Khlan Rd, Chang Khlan, Mueang, Chiang Mai 50100'),
(4,  'Wipawadee Saithong',  '084-567-8901', '78/3 Charoen Mueang Rd, Wat Ket, Mueang, Chiang Mai 50000'),
(5,  'Kittipong Srisawat',  '085-678-9012', '210 Sukhumvit Rd, Khlong Toei, Khlong Toei, Bangkok 10110'),
(6,  'Napaporn Kaewmanee',  '086-789-0123', '45/6 Ratchadaphisek Rd, Din Daeng, Din Daeng, Bangkok 10400'),
(7,  'Thanakorn Phetcharat','087-890-1234', '88 Mittraphap Rd, Nai Mueang, Mueang, Khon Kaen 40000'),
(8,  'Arunee Chanpen',      '088-901-2345', '12/7 Prachasamosorn Rd, Nai Mueang, Mueang, Khon Kaen 40000'),
(9,  'Piyapong Mankhong',   '089-012-3456', '301 Niphat Uthit 3 Rd, Hat Yai, Hat Yai, Songkhla 90110'),
(10, 'Chonthicha Boonma',   '090-123-4567', '66 Tha Phae Rd, Chang Khlan, Mueang, Chiang Mai 50100'),
(11, 'Phanupong Thongdee',  '091-234-5678', '17 Phahonyothin Rd, Pa Daet, Mueang, Chiang Mai 50100'),
(12, 'Supaporn Phithak',    '092-345-6789', '5/9 Mahidol Rd, Haiya, Mueang, Chiang Mai 50100');


-- ---------------------------------------------------------------------
-- 3. Pharmacist (8 rows) : UserID 13-20
-- ---------------------------------------------------------------------
INSERT INTO Pharmacist (UserID, LicenseNumber, Phone) VALUES
(13, 'PH-10001', '053-111-001'),
(14, 'PH-10002', '053-111-002'),
(15, 'PH-10003', '053-111-003'),
(16, 'PH-10004', '053-111-004'),
(17, 'PH-10005', '02-111-0005'),
(18, 'PH-10006', '02-111-0006'),
(19, 'PH-10007', '043-111-007'),
(20, 'PH-10008', '074-111-008');


-- ---------------------------------------------------------------------
-- 4. Pharmacy (8 rows) : 1 pharmacist = 1 pharmacy
-- ---------------------------------------------------------------------
INSERT INTO Pharmacy (PharmacyID, PharmacistID, PharmacyName, Address, ContactNumber, Description) VALUES
(1, 13, 'Healthy Life Pharmacy Nimman',    '99 Nimmanhaemin Rd, Suthep, Mueang, Chiang Mai 50200',      '053-111-001', 'Quality pharmacy with pharmacist consultation available every day.'),
(2, 14, 'Huay Kaew Pharmacy',              '120 Huay Kaew Rd, Suthep, Mueang, Chiang Mai 50200',        '053-111-002', 'Household medicines and medical supplies at fair prices.'),
(3, 15, 'Chang Khlan Pharma',              '30 Chang Khlan Rd, Chang Khlan, Mueang, Chiang Mai 50100',  '053-111-003', 'Open until 10 PM with delivery service within the city.'),
(4, 16, 'Charoen Mueang Pharmacy',         '15 Charoen Mueang Rd, Wat Ket, Mueang, Chiang Mai 50000',   '053-111-004', 'Specializes in vitamins and supplements for all ages.'),
(5, 17, 'Khlong Toei Healthcare Pharmacy', '77 Sukhumvit Rd, Khlong Toei, Khlong Toei, Bangkok 10110',  '02-111-0005', 'Pharmacy near the BTS/MRT with a complete first aid range.'),
(6, 18, 'Din Daeng Pharmacy',              '24 Ratchadaphisek Rd, Din Daeng, Din Daeng, Bangkok 10400', '02-111-0006', 'Blood pressure checks and medication advice available.'),
(7, 19, 'Mittraphap Khon Kaen Pharmacy',   '200 Mittraphap Rd, Nai Mueang, Mueang, Khon Kaen 40000',    '043-111-007', 'Friendly community pharmacy with affordable prices.'),
(8, 20, 'Hat Yai Pharmacy',                '58 Niphat Uthit 3 Rd, Hat Yai, Hat Yai, Songkhla 90110',    '074-111-008', 'Full-service pharmacy with skin care and hygiene products.');


-- ---------------------------------------------------------------------
-- 5. Product (20 rows)
-- ---------------------------------------------------------------------
INSERT INTO Product (ProductID, ProductName, Description, Category) VALUES
(1,  'Paracetamol 500 mg (10 tablets)',            'Relieves pain and reduces fever.',                       'Pain & Fever Relief'),
(2,  'Ibuprofen 200 mg (10 tablets)',              'Relieves pain and inflammation. Take after meals.',      'Pain & Fever Relief'),
(3,  'Throat Lozenges',                            'Soothes an irritated or sore throat.',                   'Cold & Sore Throat'),
(4,  'Cough Syrup 60 ml',                          'Liquid medicine that relieves cough and loosens phlegm.', 'Cold & Sore Throat'),
(5,  'Chlorpheniramine 4 mg (10 tablets)',         'Relieves runny nose and allergy symptoms. May cause drowsiness.', 'Allergy'),
(6,  'Loratadine 10 mg (10 tablets)',              'Low-drowsiness antihistamine for allergies.',            'Allergy'),
(7,  'Oral Rehydration Salts (1 sachet)',          'Replaces fluids and electrolytes during diarrhea.',      'Digestive Health'),
(8,  'Antacid Suspension 180 ml',                  'Relieves bloating and indigestion.',                     'Digestive Health'),
(9,  'Chewable Antacid Tablets (20 tablets)',      'Relieves heartburn and acid reflux.',                    'Digestive Health'),
(10, 'Vitamin C 1000 mg (30 tablets)',             'Vitamin C supplement.',                                  'Vitamins & Supplements'),
(11, 'Vitamin B Complex (30 tablets)',             'Supplement containing the B-group vitamins.',            'Vitamins & Supplements'),
(12, 'Calcium + Vitamin D (30 tablets)',           'Calcium supplement for bone and teeth health.',          'Vitamins & Supplements'),
(13, 'Fish Oil Omega-3 (30 capsules)',             'Fish oil dietary supplement.',                           'Vitamins & Supplements'),
(14, 'Rubbing Alcohol 70% 450 ml',                 'Cleans skin around wounds and surfaces.',                'First Aid'),
(15, 'Adhesive Bandages (100 pieces)',             'Standard-size adhesive bandages.',                       'First Aid'),
(16, 'Povidone-Iodine 10% 30 ml',                  'Antiseptic solution for fresh wounds.',                  'First Aid'),
(17, 'Alcohol Hand Sanitizer Gel 500 ml',          '70% alcohol hand sanitizer gel.',                        'Hygiene'),
(18, '3-Ply Surgical Face Masks (50 pieces)',      'Medical-grade disposable face masks.',                   'Hygiene'),
(19, 'Sunscreen SPF50 PA+++ 50 ml',                'Sunscreen for face and body.',                           'Skin Care'),
(20, 'Dry Skin Moisturizing Cream 200 ml',         'Rich moisturizing cream for very dry skin.',             'Skin Care');


-- ---------------------------------------------------------------------
-- 6. PharmacyProduct (20 rows) : (PharmacyID, ProductID) unique
-- ---------------------------------------------------------------------
INSERT INTO PharmacyProduct (PharmacyProductID, PharmacyID, ProductID, Quantity, Price) VALUES
(1,  1, 1,  200, 25.00),
(2,  1, 5,  150, 30.00),
(3,  1, 10,  80, 189.00),
(4,  2, 1,  300, 22.00),
(5,  2, 3,  120, 35.00),
(6,  2, 7,  250, 12.00),
(7,  3, 2,  100, 40.00),
(8,  3, 6,   90, 55.00),
(9,  3, 11,  70, 120.00),
(10, 4, 4,   60, 65.00),
(11, 4, 8,  110, 28.00),
(12, 4, 12,  50, 350.00),
(13, 5, 9,  130, 48.00),
(14, 5, 14, 140, 35.00),
(15, 5, 15, 400, 59.00),
(16, 6, 10,  90, 175.00),
(17, 6, 17,  75, 99.00),
(18, 7, 18, 200, 129.00),
(19, 7, 16, 100, 42.00),
(20, 8, 19,  60, 259.00);


-- ---------------------------------------------------------------------
-- 7. ShoppingCart (12 rows) : 1 customer = 1 cart (CartID = CustomerID)
-- ---------------------------------------------------------------------
INSERT INTO ShoppingCart (CartID, CustomerID, CreatedDate, Status) VALUES
(1,  1,  '2026-01-10 09:05:00', 'ACTIVE'),
(2,  2,  '2026-01-12 10:20:00', 'ACTIVE'),
(3,  3,  '2026-01-15 11:35:00', 'ACTIVE'),
(4,  4,  '2026-01-20 14:05:00', 'ACTIVE'),
(5,  5,  '2026-02-01 08:50:00', 'ACTIVE'),
(6,  6,  '2026-02-05 16:25:00', 'ACTIVE'),
(7,  7,  '2026-02-10 13:15:00', 'CHECKED_OUT'),
(8,  8,  '2026-02-18 10:00:00', 'CHECKED_OUT'),
(9,  9,  '2026-02-25 17:45:00', 'CHECKED_OUT'),
(10, 10, '2026-03-02 10:10:00', 'ABANDONED'),
(11, 11, '2026-03-08 12:30:00', 'ACTIVE'),
(12, 12, '2026-03-15 15:40:00', 'ACTIVE');


-- ---------------------------------------------------------------------
-- 8. CartItem (20 rows) : items currently in carts (can mix pharmacies)
--    Carts 7, 8, 9 are CHECKED_OUT, so they have no items left.
-- ---------------------------------------------------------------------
INSERT INTO CartItem (CartItemID, CartID, PharmacyProductID, Quantity) VALUES
(1,  1,  1,  2),
(2,  1,  3,  1),
(3,  2,  6,  3),
(4,  2,  5,  1),
(5,  3,  7,  1),
(6,  3,  8,  2),
(7,  4,  9,  2),
(8,  4,  12, 1),
(9,  5,  2,  2),
(10, 5,  13, 1),
(11, 6,  14, 1),
(12, 6,  15, 2),
(13, 6,  10, 1),
(14, 10, 17, 1),
(15, 10, 11, 2),
(16, 11, 16, 1),
(17, 11, 18, 1),
(18, 11, 9,  1),
(19, 12, 20, 1),
(20, 12, 19, 2);


-- ---------------------------------------------------------------------
-- 9. Order (10 rows) : CartID must belong to the same customer
--    TotalAmount = SUM(Quantity * UnitPrice) of its OrderItem rows
-- ---------------------------------------------------------------------
INSERT INTO `Order` (OrderID, CustomerID, CartID, OrderDate, TotalAmount, Status) VALUES
(1,  1, 1, '2026-08-01 10:00:00', 239.00, 'COMPLETED'),
(2,  2, 2, '2026-08-03 14:20:00',  71.00, 'COMPLETED'),
(3,  3, 3, '2026-08-10 09:30:00', 150.00, 'SHIPPED'),
(4,  4, 4, '2026-08-15 16:45:00', 470.00, 'PROCESSING'),
(5,  5, 5, '2026-08-20 11:10:00', 126.00, 'CONFIRMED'),
(6,  7, 7, '2026-08-22 13:00:00', 153.00, 'COMPLETED'),
(7,  8, 8, '2026-09-02 15:30:00', 213.00, 'COMPLETED'),
(8,  9, 9, '2026-09-10 10:45:00', 303.00, 'PENDING'),
(9,  1, 1, '2026-09-18 12:15:00', 121.00, 'COMPLETED'),
(10, 2, 2, '2026-09-25 18:00:00', 274.00, 'CANCELLED');


-- ---------------------------------------------------------------------
-- 10. OrderItem (20 rows) : UnitPrice = price snapshot at purchase time
-- ---------------------------------------------------------------------
INSERT INTO OrderItem (OrderItemID, OrderID, PharmacyProductID, Quantity, UnitPrice) VALUES
(1,  1,  1,  2, 25.00),
(2,  1,  3,  1, 189.00),
(3,  2,  6,  3, 12.00),
(4,  2,  5,  1, 35.00),
(5,  3,  7,  1, 40.00),
(6,  3,  8,  2, 55.00),
(7,  4,  9,  1, 120.00),
(8,  4,  12, 1, 350.00),
(9,  5,  2,  1, 30.00),
(10, 5,  13, 2, 48.00),
(11, 6,  15, 2, 59.00),
(12, 6,  14, 1, 35.00),
(13, 7,  18, 1, 129.00),
(14, 7,  19, 2, 42.00),
(15, 8,  20, 1, 259.00),
(16, 8,  4,  2, 22.00),
(17, 9,  11, 2, 28.00),
(18, 9,  10, 1, 65.00),
(19, 10, 16, 1, 175.00),
(20, 10, 17, 1, 99.00);


-- ---------------------------------------------------------------------
-- 11. ForumThread (20 rows) : created by customers and pharmacists
-- ---------------------------------------------------------------------
INSERT INTO ForumThread (ThreadID, UserID, Title, Description, CreatedDate) VALUES
(1,  1,  'Is it harmful to take paracetamol often?',                    'I have had frequent headaches lately and take paracetamol almost every day. Is that dangerous?',                      '2026-08-01 09:15:00'),
(2,  2,  'Which antihistamine does not cause drowsiness?',              'I drive to work every day. Can anyone recommend an allergy medicine that causes little drowsiness?',                  '2026-08-02 10:30:00'),
(3,  13, 'How to store medicines at home properly',                     'Sharing some tips on keeping household medicines safe and effective.',                                                '2026-08-04 08:00:00'),
(4,  3,  'What is the best time to take vitamin C?',                    'Should I take vitamin C in the morning or after a meal?',                                                              '2026-08-06 13:20:00'),
(5,  4,  'Cold and sore throat: when should I see a doctor?',           'I have had a cold for three days with a really bad sore throat. When should I see a doctor?',                         '2026-08-08 19:45:00'),
(6,  5,  'How do I mix ORS correctly?',                                 'I have mild diarrhea and bought oral rehydration salts, but I am not sure how to mix them.',                          '2026-08-09 07:50:00'),
(7,  14, 'Precautions when using ibuprofen',                            'A short summary of what to know before using anti-inflammatory pain relievers.',                                      '2026-08-11 10:00:00'),
(8,  6,  'Which SPF should I choose for sunscreen?',                    'I spend most days in the city. What SPF level is enough for daily use?',                                              '2026-08-12 15:10:00'),
(9,  7,  'Can calcium and vitamin D be taken together?',                'My mother is 60 and I would like her to take a calcium supplement. How should she take it?',                          '2026-08-14 11:25:00'),
(10, 8,  'Any pharmacy recommendations near Nimman?',                   'I just moved here and want a pharmacy with a pharmacist who can give advice.',                                        '2026-08-16 17:30:00'),
(11, 15, 'How to dispose of expired medicine',                          'Expired medicine should not go in the regular trash. What is the proper way to dispose of it?',                       '2026-08-18 09:40:00'),
(12, 9,  'Basic home care for a minor wound',                           'My kid scraped his knee. What are the basic steps for cleaning a wound?',                                             '2026-08-19 18:05:00'),
(13, 10, 'When should I take fish oil?',                                'I just bought fish oil. Should I take it before or after meals?',                                                     '2026-08-21 12:00:00'),
(14, 16, 'Easy skin care tips for cold weather',                        'Dry, cracked skin is common when the weather turns cold. Here are some simple ways to look after it.',               '2026-08-23 08:20:00'),
(15, 11, 'How long does delivery take for online orders?',              'How many days did your orders take to arrive?',                                                                       '2026-08-25 14:35:00'),
(16, 12, 'Antacids: before or after meals?',                            'I often get stomach burn when I am stressed. When should I take an antacid?',                                         '2026-08-27 20:10:00'),
(17, 17, 'What should be in a home medicine kit?',                      'A list of basic medicines and first aid supplies every household should have.',                                       '2026-08-29 09:00:00'),
(18, 1,  'How often should I change my face mask?',                     'I wear one outside every day. How often should I change it?',                                                         '2026-09-01 16:50:00'),
(19, 18, 'Talk to a pharmacist before combining medicine and supplements', 'Some medicines can interact with supplements, so ask a pharmacist before using them together.',                     '2026-09-05 10:15:00'),
(20, 2,  'Thanks for all the advice from the pharmacists',              'Thank you everyone for sharing your knowledge on this board. It was really helpful!',                                 '2026-09-12 21:00:00');


-- ---------------------------------------------------------------------
-- 12. Comment (20 rows) : each comment is posted AFTER its thread
-- ---------------------------------------------------------------------
INSERT INTO Comment (CommentID, ThreadID, UserID, Content, CreatedDate) VALUES
(1,  1,  13, 'Follow the dose on the label and keep the recommended interval between doses. If you need it for several days in a row, please talk to a pharmacist or doctor.', '2026-08-01 10:00:00'),
(2,  1,  2,  'Thank you, this is very helpful.',                                                                                                  '2026-08-01 11:20:00'),
(3,  1,  14, 'Also check whether your other medicines contain paracetamol, such as some cold remedies.',                                           '2026-08-01 13:05:00'),
(4,  2,  14, 'Newer antihistamines such as loratadine usually cause less drowsiness than older ones, but it varies from person to person.',        '2026-08-02 12:00:00'),
(5,  2,  1,  'I tried it and felt less sleepy. Thanks!',                                                                                           '2026-08-03 08:30:00'),
(6,  3,  3,  'Very useful. I never knew a bathroom is not a good place to keep medicine.',                                                          '2026-08-04 09:30:00'),
(7,  3,  5,  'So keep it somewhere dry, away from sunlight and out of the reach of children?',                                                     '2026-08-04 18:10:00'),
(8,  4,  15, 'Vitamin C is usually taken after a meal to reduce stomach irritation. Please also read the label of the product you use.',           '2026-08-06 14:00:00'),
(9,  4,  7,  'Thanks, I will try taking it after breakfast.',                                                                                      '2026-08-06 19:25:00'),
(10, 5,  16, 'If you have a persistent high fever, trouble breathing, or you do not get better within a few days, please see a doctor.',           '2026-08-08 21:00:00'),
(11, 5,  4,  'Thank you, I will keep an eye on my symptoms.',                                                                                      '2026-08-09 07:30:00'),
(12, 6,  17, 'Mix it with the amount of water stated on the sachet. Do not add more or less water than instructed.',                               '2026-08-09 09:15:00'),
(13, 7,  6,  'Helpful, thanks for the summary.',                                                                                                   '2026-08-11 12:40:00'),
(14, 8,  18, 'For everyday use, SPF 30 or higher is fine. Reapply if you are outdoors for a long time.',                                           '2026-08-12 16:00:00'),
(15, 9,  19, 'Please check with a pharmacist about the right dose for her age and any health conditions first.',                                   '2026-08-14 13:00:00'),
(16, 10, 20, 'Healthy Life Pharmacy Nimman has a pharmacist on duty who can give advice. You could start there.',                                 '2026-08-16 18:45:00'),
(17, 11, 8,  'I did not know it had to be separated from regular trash. Thanks for the info!',                                                    '2026-08-18 10:30:00'),
(18, 12, 13, 'Rinse with clean water, clean around the wound, then cover it with a bandage. If it is deep or the bleeding does not stop, see a doctor.', '2026-08-19 19:00:00'),
(19, 13, 15, 'Fish oil is usually recommended with or after meals to reduce nausea. Please check the product label too.',                          '2026-08-21 13:30:00'),
(20, 14, 9,  'Applying moisturizer right after a shower helps a lot.',                                                                             '2026-08-23 20:00:00');

COMMIT;

-- *** ignore below code ***

-- =====================================================================
-- Sanity checks (optional) : both queries should return NO rows
-- =====================================================================
-- Order.TotalAmount must equal SUM(Quantity * UnitPrice)
-- SELECT o.OrderID, o.TotalAmount, SUM(oi.Quantity * oi.UnitPrice) AS ItemsTotal
-- FROM `Order` o JOIN OrderItem oi ON oi.OrderID = o.OrderID
-- GROUP BY o.OrderID, o.TotalAmount
-- HAVING o.TotalAmount <> ItemsTotal;
--
-- Each pharmacist user must have Role = PHARMACIST, each customer Role = CUSTOMER
-- SELECT u.UserID FROM `User` u
-- LEFT JOIN Customer c ON c.UserID = u.UserID
-- LEFT JOIN Pharmacist p ON p.UserID = u.UserID
-- WHERE (u.Role = 'CUSTOMER'   AND c.UserID IS NULL)
--    OR (u.Role = 'PHARMACIST' AND p.UserID IS NULL);
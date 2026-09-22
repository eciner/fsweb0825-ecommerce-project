-- Idempotent, generic placeholder demo products used for local/dev exploration and contract tests.
INSERT INTO product (store_id, category_id, name, description, price, stock, rating, sell_count)
SELECT 1, c.id, 'Siyah Kadin Elbise', 'Gunluk kullanim icin siyah kadin elbise.', 299.90, 40, 4.5, 120
FROM category c WHERE c.code = 'k:Kadin Elbise'
AND NOT EXISTS (SELECT 1 FROM product WHERE name = 'Siyah Kadin Elbise');

INSERT INTO product (store_id, category_id, name, description, price, stock, rating, sell_count)
SELECT 1, c.id, 'Kirmizi Kadin Elbise', 'Ozel gunler icin kirmizi kadin elbise.', 349.50, 25, 4.1, 80
FROM category c WHERE c.code = 'k:Kadin Elbise'
AND NOT EXISTS (SELECT 1 FROM product WHERE name = 'Kirmizi Kadin Elbise');

INSERT INTO product (store_id, category_id, name, description, price, stock, rating, sell_count)
SELECT 1, c.id, 'Lacivert Kadin Elbise', 'Ofis kullanimina uygun lacivert kadin elbise.', 279.00, 60, 3.8, 45
FROM category c WHERE c.code = 'k:Kadin Elbise'
AND NOT EXISTS (SELECT 1 FROM product WHERE name = 'Lacivert Kadin Elbise');

INSERT INTO product (store_id, category_id, name, description, price, stock, rating, sell_count)
SELECT 1, c.id, 'Siyah Erkek Ceket', 'Kislik siyah erkek ceket.', 899.00, 15, 4.7, 200
FROM category c WHERE c.code = 'e:Erkek Ceket'
AND NOT EXISTS (SELECT 1 FROM product WHERE name = 'Siyah Erkek Ceket');

INSERT INTO product (store_id, category_id, name, description, price, stock, rating, sell_count)
SELECT 1, c.id, 'Gri Erkek Ceket', 'Gunluk kullanim icin gri erkek ceket.', 749.90, 30, 4.0, 90
FROM category c WHERE c.code = 'e:Erkek Ceket'
AND NOT EXISTS (SELECT 1 FROM product WHERE name = 'Gri Erkek Ceket');

INSERT INTO product (store_id, category_id, name, description, price, stock, rating, sell_count)
SELECT 1, c.id, 'Lacivert Erkek Ceket', 'Klasik kesim lacivert erkek ceket.', 649.00, 50, 3.5, 30
FROM category c WHERE c.code = 'e:Erkek Ceket'
AND NOT EXISTS (SELECT 1 FROM product WHERE name = 'Lacivert Erkek Ceket');

INSERT INTO product (store_id, category_id, name, description, price, stock, rating, sell_count)
SELECT 1, c.id, 'Beyaz Kadin Ayakkabi', 'Rahat beyaz kadin ayakkabi.', 349.50, 35, 4.5, 110
FROM category c WHERE c.code = 'k:Kadin Ayakkabi'
AND NOT EXISTS (SELECT 1 FROM product WHERE name = 'Beyaz Kadin Ayakkabi');

INSERT INTO product (store_id, category_id, name, description, price, stock, rating, sell_count)
SELECT 1, c.id, 'Mavi Erkek Gomlek', 'Gundelik mavi erkek gomlek.', 399.00, 45, 4.2, 70
FROM category c WHERE c.code = 'e:Erkek Gomlek'
AND NOT EXISTS (SELECT 1 FROM product WHERE name = 'Mavi Erkek Gomlek');

INSERT INTO product (store_id, category_id, name, description, price, stock, rating, sell_count)
SELECT 1, c.id, 'Sade Kadin Canta', 'Gunluk kullanim icin sade kadin canta.', 349.50, 20, 4.1, 65
FROM category c WHERE c.code = 'k:Kadin Canta'
AND NOT EXISTS (SELECT 1 FROM product WHERE name = 'Sade Kadin Canta');

INSERT INTO product_image (product_id, url, image_index)
SELECT p.id, 'https://picsum.photos/seed/siyah-kadin-elbise-1/480/320', 0
FROM product p WHERE p.name = 'Siyah Kadin Elbise'
AND NOT EXISTS (SELECT 1 FROM product_image pi WHERE pi.product_id = p.id);

INSERT INTO product_image (product_id, url, image_index)
SELECT p.id, 'https://picsum.photos/seed/kirmizi-kadin-elbise-1/480/320', 0
FROM product p WHERE p.name = 'Kirmizi Kadin Elbise'
AND NOT EXISTS (SELECT 1 FROM product_image pi WHERE pi.product_id = p.id);

INSERT INTO product_image (product_id, url, image_index)
SELECT p.id, 'https://picsum.photos/seed/lacivert-kadin-elbise-1/480/320', 0
FROM product p WHERE p.name = 'Lacivert Kadin Elbise'
AND NOT EXISTS (SELECT 1 FROM product_image pi WHERE pi.product_id = p.id);

INSERT INTO product_image (product_id, url, image_index)
SELECT p.id, 'https://picsum.photos/seed/siyah-erkek-ceket-1/480/320', 0
FROM product p WHERE p.name = 'Siyah Erkek Ceket'
AND NOT EXISTS (SELECT 1 FROM product_image pi WHERE pi.product_id = p.id);

INSERT INTO product_image (product_id, url, image_index)
SELECT p.id, 'https://picsum.photos/seed/gri-erkek-ceket-1/480/320', 0
FROM product p WHERE p.name = 'Gri Erkek Ceket'
AND NOT EXISTS (SELECT 1 FROM product_image pi WHERE pi.product_id = p.id);

INSERT INTO product_image (product_id, url, image_index)
SELECT p.id, 'https://picsum.photos/seed/lacivert-erkek-ceket-1/480/320', 0
FROM product p WHERE p.name = 'Lacivert Erkek Ceket'
AND NOT EXISTS (SELECT 1 FROM product_image pi WHERE pi.product_id = p.id);

INSERT INTO product_image (product_id, url, image_index)
SELECT p.id, 'https://picsum.photos/seed/beyaz-kadin-ayakkabi-1/480/320', 0
FROM product p WHERE p.name = 'Beyaz Kadin Ayakkabi'
AND NOT EXISTS (SELECT 1 FROM product_image pi WHERE pi.product_id = p.id);

INSERT INTO product_image (product_id, url, image_index)
SELECT p.id, 'https://picsum.photos/seed/mavi-erkek-gomlek-1/480/320', 0
FROM product p WHERE p.name = 'Mavi Erkek Gomlek'
AND NOT EXISTS (SELECT 1 FROM product_image pi WHERE pi.product_id = p.id);

INSERT INTO product_image (product_id, url, image_index)
SELECT p.id, 'https://picsum.photos/seed/sade-kadin-canta-1/480/320', 0
FROM product p WHERE p.name = 'Sade Kadin Canta'
AND NOT EXISTS (SELECT 1 FROM product_image pi WHERE pi.product_id = p.id);

-- Idempotent, generic placeholder categories (own dev seed data, not sourced from another project).
INSERT INTO category (title, img, gender, code, rating)
SELECT 'Kadin Elbise', 'https://picsum.photos/seed/kadin-elbise/480/320', 'k', 'k:Kadin Elbise', 4.4
WHERE NOT EXISTS (SELECT 1 FROM category WHERE code = 'k:Kadin Elbise');

INSERT INTO category (title, img, gender, code, rating)
SELECT 'Erkek Ceket', 'https://picsum.photos/seed/erkek-ceket/480/320', 'e', 'e:Erkek Ceket', 4.1
WHERE NOT EXISTS (SELECT 1 FROM category WHERE code = 'e:Erkek Ceket');

INSERT INTO category (title, img, gender, code, rating)
SELECT 'Kadin Ayakkabi', 'https://picsum.photos/seed/kadin-ayakkabi/480/320', 'k', 'k:Kadin Ayakkabi', 4.7
WHERE NOT EXISTS (SELECT 1 FROM category WHERE code = 'k:Kadin Ayakkabi');

INSERT INTO category (title, img, gender, code, rating)
SELECT 'Erkek Gomlek', 'https://picsum.photos/seed/erkek-gomlek/480/320', 'e', 'e:Erkek Gomlek', 4.3
WHERE NOT EXISTS (SELECT 1 FROM category WHERE code = 'e:Erkek Gomlek');

INSERT INTO category (title, img, gender, code, rating)
SELECT 'Kadin Canta', 'https://picsum.photos/seed/kadin-canta/480/320', 'k', 'k:Kadin Canta', 3.9
WHERE NOT EXISTS (SELECT 1 FROM category WHERE code = 'k:Kadin Canta');

-- Add catalog entries without replacing existing IDs, prices, inventory or order data.

INSERT INTO category (title,img,gender,code,rating) SELECT 'Kadin Bluz','/catalog/ivory-blouse.svg','k','k:Kadin Bluz',0 WHERE NOT EXISTS (SELECT 1 FROM category WHERE code='k:Kadin Bluz');

INSERT INTO category (title,img,gender,code,rating) SELECT 'Kadin Etek','/catalog/green-skirt.svg','k','k:Kadin Etek',0 WHERE NOT EXISTS (SELECT 1 FROM category WHERE code='k:Kadin Etek');

INSERT INTO category (title,img,gender,code,rating) SELECT 'Kadin Kaban','/catalog/camel-coat.svg','k','k:Kadin Kaban',0 WHERE NOT EXISTS (SELECT 1 FROM category WHERE code='k:Kadin Kaban');

INSERT INTO category (title,img,gender,code,rating) SELECT 'Erkek Ayakkabi','/catalog/brown-shoe.svg','e','e:Erkek Ayakkabi',0 WHERE NOT EXISTS (SELECT 1 FROM category WHERE code='e:Erkek Ayakkabi');

INSERT INTO category (title,img,gender,code,rating) SELECT 'Erkek Canta','/catalog/navy-bag.svg','e','e:Erkek Canta',0 WHERE NOT EXISTS (SELECT 1 FROM category WHERE code='e:Erkek Canta');

INSERT INTO category (title,img,gender,code,rating) SELECT 'Erkek Tisort','/catalog/green-tee.svg','e','e:Erkek Tisort',0 WHERE NOT EXISTS (SELECT 1 FROM category WHERE code='e:Erkek Tisort');

INSERT INTO category (title,img,gender,code,rating) SELECT 'Erkek Pantolon','/catalog/sand-trousers.svg','e','e:Erkek Pantolon',0 WHERE NOT EXISTS (SELECT 1 FROM category WHERE code='e:Erkek Pantolon');

INSERT INTO product (store_id,category_id,name,description,price,stock,rating,sell_count) SELECT 1,c.id,'Ekru Kadin Bluz','Ivory blouse. Demo catalog item shown with an original illustration.',259,30,0,0 FROM category c WHERE c.code='k:Kadin Bluz' AND NOT EXISTS (SELECT 1 FROM product WHERE name='Ekru Kadin Bluz');

INSERT INTO product (store_id,category_id,name,description,price,stock,rating,sell_count) SELECT 1,c.id,'Yesil Kadin Etek','Green skirt. Demo catalog item shown with an original illustration.',289,30,0,0 FROM category c WHERE c.code='k:Kadin Etek' AND NOT EXISTS (SELECT 1 FROM product WHERE name='Yesil Kadin Etek');

INSERT INTO product (store_id,category_id,name,description,price,stock,rating,sell_count) SELECT 1,c.id,'Deve Tuyu Kadin Kaban','Camel coat. Demo catalog item shown with an original illustration.',1199,30,0,0 FROM category c WHERE c.code='k:Kadin Kaban' AND NOT EXISTS (SELECT 1 FROM product WHERE name='Deve Tuyu Kadin Kaban');

INSERT INTO product (store_id,category_id,name,description,price,stock,rating,sell_count) SELECT 1,c.id,'Kahverengi Erkek Ayakkabi','Brown shoe. Demo catalog item shown with an original illustration.',599,30,0,0 FROM category c WHERE c.code='e:Erkek Ayakkabi' AND NOT EXISTS (SELECT 1 FROM product WHERE name='Kahverengi Erkek Ayakkabi');

INSERT INTO product (store_id,category_id,name,description,price,stock,rating,sell_count) SELECT 1,c.id,'Lacivert Erkek Canta','Navy bag. Demo catalog item shown with an original illustration.',429,30,0,0 FROM category c WHERE c.code='e:Erkek Canta' AND NOT EXISTS (SELECT 1 FROM product WHERE name='Lacivert Erkek Canta');

INSERT INTO product (store_id,category_id,name,description,price,stock,rating,sell_count) SELECT 1,c.id,'Yesil Erkek Tisort','Green T-shirt. Demo catalog item shown with an original illustration.',199,30,0,0 FROM category c WHERE c.code='e:Erkek Tisort' AND NOT EXISTS (SELECT 1 FROM product WHERE name='Yesil Erkek Tisort');

INSERT INTO product (store_id,category_id,name,description,price,stock,rating,sell_count) SELECT 1,c.id,'Kum Rengi Erkek Pantolon','Sand trousers. Demo catalog item shown with an original illustration.',459,30,0,0 FROM category c WHERE c.code='e:Erkek Pantolon' AND NOT EXISTS (SELECT 1 FROM product WHERE name='Kum Rengi Erkek Pantolon');

UPDATE product_image SET url='/catalog/black-dress.svg' WHERE product_id IN (SELECT id FROM product WHERE name='Siyah Kadin Elbise') AND url LIKE 'https://picsum.photos/%';

INSERT INTO product_image (product_id,url,image_index) SELECT id,'/catalog/black-dress.svg',0 FROM product p WHERE name='Siyah Kadin Elbise' AND NOT EXISTS (SELECT 1 FROM product_image pi WHERE pi.product_id=p.id);

UPDATE product_image SET url='/catalog/red-dress.svg' WHERE product_id IN (SELECT id FROM product WHERE name='Kirmizi Kadin Elbise') AND url LIKE 'https://picsum.photos/%';

INSERT INTO product_image (product_id,url,image_index) SELECT id,'/catalog/red-dress.svg',0 FROM product p WHERE name='Kirmizi Kadin Elbise' AND NOT EXISTS (SELECT 1 FROM product_image pi WHERE pi.product_id=p.id);

UPDATE product_image SET url='/catalog/navy-dress.svg' WHERE product_id IN (SELECT id FROM product WHERE name='Lacivert Kadin Elbise') AND url LIKE 'https://picsum.photos/%';

INSERT INTO product_image (product_id,url,image_index) SELECT id,'/catalog/navy-dress.svg',0 FROM product p WHERE name='Lacivert Kadin Elbise' AND NOT EXISTS (SELECT 1 FROM product_image pi WHERE pi.product_id=p.id);

UPDATE product_image SET url='/catalog/black-jacket.svg' WHERE product_id IN (SELECT id FROM product WHERE name='Siyah Erkek Ceket') AND url LIKE 'https://picsum.photos/%';

INSERT INTO product_image (product_id,url,image_index) SELECT id,'/catalog/black-jacket.svg',0 FROM product p WHERE name='Siyah Erkek Ceket' AND NOT EXISTS (SELECT 1 FROM product_image pi WHERE pi.product_id=p.id);

UPDATE product_image SET url='/catalog/grey-jacket.svg' WHERE product_id IN (SELECT id FROM product WHERE name='Gri Erkek Ceket') AND url LIKE 'https://picsum.photos/%';

INSERT INTO product_image (product_id,url,image_index) SELECT id,'/catalog/grey-jacket.svg',0 FROM product p WHERE name='Gri Erkek Ceket' AND NOT EXISTS (SELECT 1 FROM product_image pi WHERE pi.product_id=p.id);

UPDATE product_image SET url='/catalog/navy-jacket.svg' WHERE product_id IN (SELECT id FROM product WHERE name='Lacivert Erkek Ceket') AND url LIKE 'https://picsum.photos/%';

INSERT INTO product_image (product_id,url,image_index) SELECT id,'/catalog/navy-jacket.svg',0 FROM product p WHERE name='Lacivert Erkek Ceket' AND NOT EXISTS (SELECT 1 FROM product_image pi WHERE pi.product_id=p.id);

UPDATE product_image SET url='/catalog/white-shoe.svg' WHERE product_id IN (SELECT id FROM product WHERE name='Beyaz Kadin Ayakkabi') AND url LIKE 'https://picsum.photos/%';

INSERT INTO product_image (product_id,url,image_index) SELECT id,'/catalog/white-shoe.svg',0 FROM product p WHERE name='Beyaz Kadin Ayakkabi' AND NOT EXISTS (SELECT 1 FROM product_image pi WHERE pi.product_id=p.id);

UPDATE product_image SET url='/catalog/blue-shirt.svg' WHERE product_id IN (SELECT id FROM product WHERE name='Mavi Erkek Gomlek') AND url LIKE 'https://picsum.photos/%';

INSERT INTO product_image (product_id,url,image_index) SELECT id,'/catalog/blue-shirt.svg',0 FROM product p WHERE name='Mavi Erkek Gomlek' AND NOT EXISTS (SELECT 1 FROM product_image pi WHERE pi.product_id=p.id);

UPDATE product_image SET url='/catalog/tan-bag.svg' WHERE product_id IN (SELECT id FROM product WHERE name='Sade Kadin Canta') AND url LIKE 'https://picsum.photos/%';

INSERT INTO product_image (product_id,url,image_index) SELECT id,'/catalog/tan-bag.svg',0 FROM product p WHERE name='Sade Kadin Canta' AND NOT EXISTS (SELECT 1 FROM product_image pi WHERE pi.product_id=p.id);

UPDATE product_image SET url='/catalog/ivory-blouse.svg' WHERE product_id IN (SELECT id FROM product WHERE name='Ekru Kadin Bluz') AND url LIKE 'https://picsum.photos/%';

INSERT INTO product_image (product_id,url,image_index) SELECT id,'/catalog/ivory-blouse.svg',0 FROM product p WHERE name='Ekru Kadin Bluz' AND NOT EXISTS (SELECT 1 FROM product_image pi WHERE pi.product_id=p.id);

UPDATE product_image SET url='/catalog/green-skirt.svg' WHERE product_id IN (SELECT id FROM product WHERE name='Yesil Kadin Etek') AND url LIKE 'https://picsum.photos/%';

INSERT INTO product_image (product_id,url,image_index) SELECT id,'/catalog/green-skirt.svg',0 FROM product p WHERE name='Yesil Kadin Etek' AND NOT EXISTS (SELECT 1 FROM product_image pi WHERE pi.product_id=p.id);

UPDATE product_image SET url='/catalog/camel-coat.svg' WHERE product_id IN (SELECT id FROM product WHERE name='Deve Tuyu Kadin Kaban') AND url LIKE 'https://picsum.photos/%';

INSERT INTO product_image (product_id,url,image_index) SELECT id,'/catalog/camel-coat.svg',0 FROM product p WHERE name='Deve Tuyu Kadin Kaban' AND NOT EXISTS (SELECT 1 FROM product_image pi WHERE pi.product_id=p.id);

UPDATE product_image SET url='/catalog/brown-shoe.svg' WHERE product_id IN (SELECT id FROM product WHERE name='Kahverengi Erkek Ayakkabi') AND url LIKE 'https://picsum.photos/%';

INSERT INTO product_image (product_id,url,image_index) SELECT id,'/catalog/brown-shoe.svg',0 FROM product p WHERE name='Kahverengi Erkek Ayakkabi' AND NOT EXISTS (SELECT 1 FROM product_image pi WHERE pi.product_id=p.id);

UPDATE product_image SET url='/catalog/navy-bag.svg' WHERE product_id IN (SELECT id FROM product WHERE name='Lacivert Erkek Canta') AND url LIKE 'https://picsum.photos/%';

INSERT INTO product_image (product_id,url,image_index) SELECT id,'/catalog/navy-bag.svg',0 FROM product p WHERE name='Lacivert Erkek Canta' AND NOT EXISTS (SELECT 1 FROM product_image pi WHERE pi.product_id=p.id);

UPDATE product_image SET url='/catalog/green-tee.svg' WHERE product_id IN (SELECT id FROM product WHERE name='Yesil Erkek Tisort') AND url LIKE 'https://picsum.photos/%';

INSERT INTO product_image (product_id,url,image_index) SELECT id,'/catalog/green-tee.svg',0 FROM product p WHERE name='Yesil Erkek Tisort' AND NOT EXISTS (SELECT 1 FROM product_image pi WHERE pi.product_id=p.id);

UPDATE product_image SET url='/catalog/sand-trousers.svg' WHERE product_id IN (SELECT id FROM product WHERE name='Kum Rengi Erkek Pantolon') AND url LIKE 'https://picsum.photos/%';

INSERT INTO product_image (product_id,url,image_index) SELECT id,'/catalog/sand-trousers.svg',0 FROM product p WHERE name='Kum Rengi Erkek Pantolon' AND NOT EXISTS (SELECT 1 FROM product_image pi WHERE pi.product_id=p.id);

UPDATE category SET img='/catalog/black-dress.svg' WHERE code='k:Kadin Elbise' AND img LIKE 'https://picsum.photos/%';

UPDATE category SET img='/catalog/black-jacket.svg' WHERE code='e:Erkek Ceket' AND img LIKE 'https://picsum.photos/%';

UPDATE category SET img='/catalog/white-shoe.svg' WHERE code='k:Kadin Ayakkabi' AND img LIKE 'https://picsum.photos/%';

UPDATE category SET img='/catalog/blue-shirt.svg' WHERE code='e:Erkek Gomlek' AND img LIKE 'https://picsum.photos/%';

UPDATE category SET img='/catalog/tan-bag.svg' WHERE code='k:Kadin Canta' AND img LIKE 'https://picsum.photos/%';

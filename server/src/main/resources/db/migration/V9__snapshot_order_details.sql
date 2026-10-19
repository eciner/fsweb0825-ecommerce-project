-- Nullable snapshot columns intentionally do not invent historical names or addresses.
ALTER TABLE customer_order ADD COLUMN receipt_address_id BIGINT;
ALTER TABLE customer_order ADD COLUMN shipping_address VARCHAR(1500);
ALTER TABLE customer_order ADD COLUMN receipt_address VARCHAR(1500);
ALTER TABLE customer_order ADD COLUMN currency VARCHAR(3);
ALTER TABLE order_item ADD COLUMN product_name VARCHAR(200);
ALTER TABLE order_item ADD COLUMN image_url VARCHAR(500);

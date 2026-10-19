-- Optional customer-scoped request identity; legacy orders remain null.
ALTER TABLE customer_order ADD COLUMN request_id UUID;
ALTER TABLE customer_order ADD COLUMN request_fingerprint VARCHAR(64);
ALTER TABLE customer_order ADD CONSTRAINT uq_order_owner_request UNIQUE (user_id, request_id);

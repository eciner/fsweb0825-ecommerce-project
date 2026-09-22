-- Idempotent role seed: safe to re-apply to a database that already has these rows.
INSERT INTO role (name, code)
SELECT 'Admin', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM role WHERE code = 'admin');

INSERT INTO role (name, code)
SELECT 'Store', 'store'
WHERE NOT EXISTS (SELECT 1 FROM role WHERE code = 'store');

INSERT INTO role (name, code)
SELECT 'Customer', 'customer'
WHERE NOT EXISTS (SELECT 1 FROM role WHERE code = 'customer');

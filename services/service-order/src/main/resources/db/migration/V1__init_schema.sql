-- ===========================================================================
-- service-order : schéma initial
-- ===========================================================================

CREATE TABLE IF NOT EXISTS orders (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL,
    restaurant_id       UUID NOT NULL,
    type                VARCHAR(30) NOT NULL DEFAULT 'CLICK_AND_COLLECT',
    status              VARCHAR(30) NOT NULL DEFAULT 'CREATED',
    subtotal            NUMERIC(10,2),
    tax_amount          NUMERIC(10,2),
    discount_amount     NUMERIC(10,2) DEFAULT 0,
    delivery_fee        NUMERIC(10,2) DEFAULT 0,
    total_amount        NUMERIC(10,2),
    promo_code          VARCHAR(50),
    pickup_time         TIMESTAMPTZ,
    delivery_address    TEXT,
    notes               TEXT,
    idempotency_key     VARCHAR(255) UNIQUE,
    payment_id          UUID,
    delivery_id         UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id    VARCHAR(100) NOT NULL,
    item_name       VARCHAR(255) NOT NULL,
    quantity        INTEGER NOT NULL CHECK (quantity > 0),
    unit_price      NUMERIC(10,2) NOT NULL,
    total_price     NUMERIC(10,2) NOT NULL,
    notes           TEXT
);

-- Outbox pattern pour publication Kafka transactionnelle
CREATE TABLE IF NOT EXISTS outbox_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_id    UUID NOT NULL,
    aggregate_type  VARCHAR(50) NOT NULL,
    event_type      VARCHAR(100) NOT NULL,
    payload         JSONB NOT NULL,
    published       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_idempotency ON orders(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_outbox_unpublished ON outbox_events(published) WHERE NOT published;

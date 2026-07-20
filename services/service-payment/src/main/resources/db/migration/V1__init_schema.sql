-- ===========================================================================
-- service-payment : schéma initial
-- ===========================================================================

CREATE TABLE IF NOT EXISTS payments (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id                    UUID NOT NULL UNIQUE,
    user_id                     UUID NOT NULL,
    amount                      NUMERIC(10,2) NOT NULL,
    currency                    CHAR(3) NOT NULL DEFAULT 'EUR',
    status                      VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    stripe_payment_intent_id    VARCHAR(255) UNIQUE,
    stripe_client_secret        TEXT,
    idempotency_key             VARCHAR(255) UNIQUE,
    failure_reason              TEXT,
    invoice_url                 TEXT,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refunds (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id          UUID NOT NULL REFERENCES payments(id),
    amount              NUMERIC(10,2) NOT NULL,
    stripe_refund_id    VARCHAR(255) UNIQUE,
    reason              TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_intent ON payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- ===========================================================================
-- service-reservation : schéma initial
-- ===========================================================================

CREATE TABLE IF NOT EXISTS reservations (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id       UUID NOT NULL,
    user_id             UUID NOT NULL,
    reservation_date    DATE NOT NULL,
    start_time          TIME NOT NULL,
    end_time            TIME,
    guests_count        INTEGER NOT NULL CHECK (guests_count > 0),
    table_id            UUID,
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    special_requests    TEXT,
    idempotency_key     VARCHAR(255) UNIQUE,
    version             BIGINT NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reservations_restaurant_date
    ON reservations(restaurant_id, reservation_date);

CREATE INDEX IF NOT EXISTS idx_reservations_user
    ON reservations(user_id);

CREATE INDEX IF NOT EXISTS idx_reservations_status
    ON reservations(status);

CREATE INDEX IF NOT EXISTS idx_reservations_idempotency
    ON reservations(idempotency_key);

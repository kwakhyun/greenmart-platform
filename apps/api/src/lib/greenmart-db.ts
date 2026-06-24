import { AsyncLocalStorage } from "async_hooks";
import { existsSync, readFileSync } from "fs";
import path from "path";
import { Pool, type PoolClient, type QueryResultRow } from "pg";
import {
  categories,
  brands,
  products as catalogProducts,
} from "../data/catalog";
import {
  customers,
  coupons,
  promotions,
  customerVoices,
} from "../data/customer";
import {
  warehouses,
  inventoryItems,
  deliveries,
  stockMovements,
} from "../data/inventory";
import { orders, settlements, dashboardSummary } from "../data/settlement";

export const DB_COLLECTIONS = {
  catalogCategories: "catalog_categories",
  catalogBrands: "catalog_brands",
  catalogProducts: "catalog_products",
  customerMembers: "customer_members",
  customerCoupons: "customer_coupons",
  customerPromotions: "customer_promotions",
  customerVoc: "customer_voc",
  inventoryWarehouses: "inventory_warehouses",
  inventoryStock: "inventory_stock",
  inventoryDeliveries: "inventory_deliveries",
  inventoryMovements: "inventory_movements",
  settlementOrders: "settlement_orders",
  settlementSettlements: "settlement_settlements",
  settlementDashboard: "settlement_dashboard",
  serviceProducts: "service_products",
  serviceDeliverySlots: "service_delivery_slots",
  serviceSubscriptionPlans: "service_subscription_plans",
  orderRequests: "order_requests",
  outboxEvents: "outbox_events",
} as const;

export type ServiceProduct = {
  id: string;
  catalogProductId: string;
  name: string;
  farm: string;
  category: "채소" | "과일" | "간편식" | "유제품";
  price: number;
  unit: string;
  image: string;
  description: string;
  badges: string[];
  stock: number;
};

export type DeliverySlot = {
  id: string;
  label: string;
  time: string;
  capacity: string;
};

export type SubscriptionPlan = {
  id: "once" | "weekly" | "biweekly";
  title: string;
  summary: string;
  discount: string;
};

export type ServiceCatalog = {
  products: ServiceProduct[];
  deliverySlots: DeliverySlot[];
  subscriptionPlans: SubscriptionPlan[];
};

export type StoredOutboxEvent = {
  id: string;
  aggregateId: string;
  aggregateType: "ORDER_REQUEST";
  eventType: "ORDER_REQUEST_WEBHOOK";
  payload: unknown;
  status:
    | "PENDING"
    | "PROCESSING"
    | "DELIVERED"
    | "FAILED"
    | "DEAD_LETTER"
    | "SKIPPED";
  attempts: number;
  maxAttempts: number;
  nextAttemptAt: string;
  lockedAt?: string;
  deliveredAt?: string;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
};

type OrderRequestRecord = {
  id: string;
  orderNumber: string;
  customer: unknown;
  deliverySlot: unknown;
  subscriptionPlan: unknown;
  items: Array<{
    id: string;
    name: string;
    unit: string;
    price: number;
    quantity: number;
  }>;
  pricing: unknown;
  status: string;
  fulfillmentRisk: string;
  riskReasons: string[];
  slaDueAt: string;
  webhookSyncStatus: string;
  webhookAttempts: number;
  nextWebhookAttemptAt?: string;
  idempotencyKey: string;
  payloadHash: string;
  acceptedAt: string;
  updatedAt: string;
  auditTrail: Array<{
    id: string;
    type: string;
    message: string;
    createdAt: string;
  }>;
};

type GreenmartGlobal = typeof globalThis & {
  __greenmartDatabaseUrl?: string;
};

const SEED_VERSION = "2026-06-25-postgres-v1";
const DEFAULT_DEVELOPMENT_DATABASE_URL =
  "postgres://greenmart:greenmart@localhost:5432/greenmart";
const txStorage = new AsyncLocalStorage<PoolClient>();
const globalDatabase = globalThis as GreenmartGlobal;

let pool: Pool | null = null;
let setupPromise: Promise<void> | null = null;

function parseEnvFile(filePath: string) {
  if (!existsSync(filePath)) return {};

  return readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .reduce<Record<string, string>>((env, line) => {
      const match = line
        .trim()
        .match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (!match) return env;

      let value = match[2].trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      env[match[1]] = value;
      return env;
    }, {});
}

function getDatabaseUrlFromEnvFiles() {
  const cwd = process.cwd();
  const candidates = [
    path.join(cwd, ".env.local"),
    path.join(cwd, ".env"),
    path.resolve(cwd, "../..", ".env.local"),
    path.resolve(cwd, "../..", ".env"),
  ];

  for (const candidate of candidates) {
    const env = parseEnvFile(candidate);
    const value = env.GREENMART_DATABASE_URL || env.DATABASE_URL;
    if (value?.trim()) return value.trim();
  }

  return undefined;
}

function getDatabaseUrl() {
  const configured = [
    globalDatabase.__greenmartDatabaseUrl,
    process.env.GREENMART_DATABASE_URL,
    process.env.DATABASE_URL,
    getDatabaseUrlFromEnvFiles(),
  ].find((value) => value?.trim());

  if (configured?.trim()) return configured.trim();
  if (process.env.NODE_ENV !== "production") {
    return DEFAULT_DEVELOPMENT_DATABASE_URL;
  }

  return undefined;
}

function getPool() {
  if (pool) return pool;

  const connectionString = getDatabaseUrl();
  if (!connectionString) {
    throw new Error(
      "Postgres 연결 정보가 없습니다. DATABASE_URL 또는 GREENMART_DATABASE_URL을 apps/api/.env.local, 루트 .env, 또는 실행 환경 변수에 설정하세요.",
    );
  }

  pool = new Pool({
    connectionString,
    max: Number(process.env.GREENMART_DB_POOL_MAX ?? (process.env.VERCEL ? 1 : 10)),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });
  return pool;
}

async function ensureDatabase() {
  if (setupPromise) return setupPromise;

  setupPromise = (async () => {
    let client: PoolClient | null = null;
    let transactionStarted = false;

    try {
      client = await getPool().connect();
      await client.query("BEGIN");
      transactionStarted = true;
      await client.query(SCHEMA_SQL);
      await seedDatabase(client);
      await client.query("COMMIT");
      transactionStarted = false;
    } catch (error) {
      if (client && transactionStarted) {
        await client.query("ROLLBACK").catch(() => undefined);
      }
      setupPromise = null;
      if (isPostgresConnectionError(error)) {
        throw new Error(
          `Postgres에 연결하지 못했습니다. 로컬 개발에서는 \`docker compose up -d postgres\`를 먼저 실행하거나 DATABASE_URL을 확인하세요. (${error instanceof Error ? error.message : "unknown connection error"})`,
        );
      }
      throw error;
    } finally {
      client?.release();
    }
  })();

  return setupPromise;
}

function isPostgresConnectionError(error: unknown) {
  const candidate = error as { code?: string; message?: string };
  return (
    ["ECONNREFUSED", "ENOTFOUND", "ETIMEDOUT"].includes(
      candidate.code ?? "",
    ) ||
    candidate.message?.includes("connect ECONNREFUSED") ||
    candidate.message?.includes("getaddrinfo ENOTFOUND")
  );
}

async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  values: unknown[] = [],
) {
  await ensureDatabase();
  const txClient = txStorage.getStore();
  return txClient
    ? txClient.query<T>(text, values)
    : getPool().query<T>(text, values);
}

function normalizeTimestamp(value: unknown) {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString();
  return new Date(String(value)).toISOString();
}

async function collectionCount(client: PoolClient, collection: string) {
  const result = await client.query<{ count: string }>(
    "SELECT COUNT(*) AS count FROM greenmart_records WHERE collection = $1",
    [collection],
  );
  return Number(result.rows[0]?.count ?? 0);
}

async function putSeedRecords<T extends { id: string }>(
  client: PoolClient,
  collection: string,
  records: T[],
) {
  if ((await collectionCount(client, collection)) > 0) return;

  for (const record of records) {
    await client.query(
      `
        INSERT INTO greenmart_records (collection, id, data, created_at, updated_at)
        VALUES ($1, $2, $3::jsonb, NOW(), NOW())
        ON CONFLICT (collection, id) DO NOTHING
      `,
      [collection, record.id, JSON.stringify(record)],
    );
  }
}

async function seedDatabase(client: PoolClient) {
  const seedVersion = await client.query<{ value: string }>(
    "SELECT value FROM greenmart_meta WHERE key = $1",
    ["seed_version"],
  );

  if (seedVersion.rows[0]?.value === SEED_VERSION) return;

  await putSeedRecords(client, DB_COLLECTIONS.catalogCategories, categories);
  await putSeedRecords(client, DB_COLLECTIONS.catalogBrands, brands);
  await putSeedRecords(client, DB_COLLECTIONS.catalogProducts, catalogProducts);
  await putSeedRecords(client, DB_COLLECTIONS.customerMembers, customers);
  await putSeedRecords(client, DB_COLLECTIONS.customerCoupons, coupons);
  await putSeedRecords(client, DB_COLLECTIONS.customerPromotions, promotions);
  await putSeedRecords(client, DB_COLLECTIONS.customerVoc, customerVoices);
  await putSeedRecords(client, DB_COLLECTIONS.inventoryWarehouses, warehouses);
  await putSeedRecords(client, DB_COLLECTIONS.inventoryStock, inventoryItems);
  await putSeedRecords(client, DB_COLLECTIONS.inventoryDeliveries, deliveries);
  await putSeedRecords(client, DB_COLLECTIONS.inventoryMovements, stockMovements);
  await putSeedRecords(client, DB_COLLECTIONS.settlementOrders, orders);
  await putSeedRecords(client, DB_COLLECTIONS.settlementSettlements, settlements);
  await putSeedRecords(client, DB_COLLECTIONS.settlementDashboard, [
    { id: "summary", ...dashboardSummary },
  ]);
  await putSeedRecords(client, DB_COLLECTIONS.serviceProducts, serviceProductsSeed);
  await putSeedRecords(
    client,
    DB_COLLECTIONS.serviceDeliverySlots,
    deliverySlotsSeed,
  );
  await putSeedRecords(
    client,
    DB_COLLECTIONS.serviceSubscriptionPlans,
    subscriptionPlansSeed,
  );

  await client.query(
    `
      INSERT INTO greenmart_meta (key, value, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value,
        updated_at = EXCLUDED.updated_at
    `,
    ["seed_version", SEED_VERSION],
  );
}

function rowToOutboxEvent(row: QueryResultRow): StoredOutboxEvent {
  return {
    id: String(row.id),
    aggregateId: String(row.aggregate_id),
    aggregateType: row.aggregate_type,
    eventType: row.event_type,
    payload: row.payload,
    status: row.status,
    attempts: Number(row.attempts),
    maxAttempts: Number(row.max_attempts),
    nextAttemptAt: normalizeTimestamp(row.next_attempt_at) ?? new Date().toISOString(),
    lockedAt: normalizeTimestamp(row.locked_at),
    deliveredAt: normalizeTimestamp(row.delivered_at),
    lastError: row.last_error ?? undefined,
    createdAt: normalizeTimestamp(row.created_at) ?? new Date().toISOString(),
    updatedAt: normalizeTimestamp(row.updated_at) ?? new Date().toISOString(),
  };
}

async function listOutboxEvents<T>() {
  const result = await query(`
    SELECT *
    FROM greenmart_outbox_events
    ORDER BY created_at DESC
  `);
  return result.rows.map(rowToOutboxEvent) as T[];
}

async function getOutboxEvent<T>(id: string) {
  const result = await query("SELECT * FROM greenmart_outbox_events WHERE id = $1", [
    id,
  ]);
  return result.rows[0] ? (rowToOutboxEvent(result.rows[0]) as T) : null;
}

async function putOutboxEvent<T extends { id: string }>(record: T) {
  const event = record as T & StoredOutboxEvent;
  await query(
    `
      INSERT INTO greenmart_outbox_events (
        id,
        aggregate_id,
        aggregate_type,
        event_type,
        payload,
        status,
        attempts,
        max_attempts,
        next_attempt_at,
        locked_at,
        delivered_at,
        last_error,
        created_at,
        updated_at
      )
      VALUES (
        $1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9::timestamptz, $10::timestamptz,
        $11::timestamptz, $12, $13::timestamptz, $14::timestamptz
      )
      ON CONFLICT (id) DO UPDATE SET
        aggregate_id = EXCLUDED.aggregate_id,
        aggregate_type = EXCLUDED.aggregate_type,
        event_type = EXCLUDED.event_type,
        payload = EXCLUDED.payload,
        status = EXCLUDED.status,
        attempts = EXCLUDED.attempts,
        max_attempts = EXCLUDED.max_attempts,
        next_attempt_at = EXCLUDED.next_attempt_at,
        locked_at = EXCLUDED.locked_at,
        delivered_at = EXCLUDED.delivered_at,
        last_error = EXCLUDED.last_error,
        updated_at = EXCLUDED.updated_at
    `,
    [
      event.id,
      event.aggregateId,
      event.aggregateType,
      event.eventType,
      JSON.stringify(event.payload),
      event.status,
      event.attempts,
      event.maxAttempts,
      event.nextAttemptAt,
      event.lockedAt ?? null,
      event.deliveredAt ?? null,
      event.lastError ?? null,
      event.createdAt,
      event.updatedAt,
    ],
  );
  return record;
}

async function deleteOutboxEvent(id: string) {
  const result = await query("DELETE FROM greenmart_outbox_events WHERE id = $1", [
    id,
  ]);
  return result.rowCount ?? 0;
}

async function replaceOutboxEvents<T extends { id: string }>(records: T[]) {
  await withDatabaseTransaction(async () => {
    await query("DELETE FROM greenmart_outbox_events");
    for (const record of records) {
      await putOutboxEvent(record);
    }
  });
}

async function listOrderRequestRecords<T>() {
  const result = await query(`
    SELECT data
    FROM greenmart_order_requests
    ORDER BY accepted_at DESC
  `);
  return result.rows.map((row) => row.data as T);
}

async function getOrderRequestRecord<T>(id: string) {
  const result = await query("SELECT data FROM greenmart_order_requests WHERE id = $1", [
    id,
  ]);
  return result.rows[0] ? (result.rows[0].data as T) : null;
}

async function putOrderRequestRecord<T extends { id: string }>(record: T) {
  const orderRequest = record as T & OrderRequestRecord;

  await withDatabaseTransaction(async () => {
    await query(
      `
        INSERT INTO greenmart_order_requests (
          id,
          order_number,
          idempotency_key,
          payload_hash,
          status,
          fulfillment_risk,
          webhook_sync_status,
          webhook_attempts,
          next_webhook_attempt_at,
          accepted_at,
          updated_at,
          sla_due_at,
          customer,
          delivery_slot,
          subscription_plan,
          pricing,
          risk_reasons,
          data
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9::timestamptz, $10::timestamptz,
          $11::timestamptz, $12::timestamptz, $13::jsonb, $14::jsonb, $15::jsonb,
          $16::jsonb, $17::jsonb, $18::jsonb
        )
        ON CONFLICT (id) DO UPDATE SET
          order_number = EXCLUDED.order_number,
          idempotency_key = EXCLUDED.idempotency_key,
          payload_hash = EXCLUDED.payload_hash,
          status = EXCLUDED.status,
          fulfillment_risk = EXCLUDED.fulfillment_risk,
          webhook_sync_status = EXCLUDED.webhook_sync_status,
          webhook_attempts = EXCLUDED.webhook_attempts,
          next_webhook_attempt_at = EXCLUDED.next_webhook_attempt_at,
          updated_at = EXCLUDED.updated_at,
          sla_due_at = EXCLUDED.sla_due_at,
          customer = EXCLUDED.customer,
          delivery_slot = EXCLUDED.delivery_slot,
          subscription_plan = EXCLUDED.subscription_plan,
          pricing = EXCLUDED.pricing,
          risk_reasons = EXCLUDED.risk_reasons,
          data = EXCLUDED.data
      `,
      [
        orderRequest.id,
        orderRequest.orderNumber,
        orderRequest.idempotencyKey,
        orderRequest.payloadHash,
        orderRequest.status,
        orderRequest.fulfillmentRisk,
        orderRequest.webhookSyncStatus,
        orderRequest.webhookAttempts,
        orderRequest.nextWebhookAttemptAt ?? null,
        orderRequest.acceptedAt,
        orderRequest.updatedAt,
        orderRequest.slaDueAt,
        JSON.stringify(orderRequest.customer),
        JSON.stringify(orderRequest.deliverySlot),
        JSON.stringify(orderRequest.subscriptionPlan),
        JSON.stringify(orderRequest.pricing),
        JSON.stringify(orderRequest.riskReasons),
        JSON.stringify(orderRequest),
      ],
    );

    await query(
      "DELETE FROM greenmart_order_request_items WHERE order_request_id = $1",
      [orderRequest.id],
    );
    await query(
      "DELETE FROM greenmart_order_request_audit_events WHERE order_request_id = $1",
      [orderRequest.id],
    );

    for (const [index, item] of orderRequest.items.entries()) {
      await query(
        `
          INSERT INTO greenmart_order_request_items (
            order_request_id,
            line_no,
            product_id,
            name,
            unit,
            price,
            quantity
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
        [
          orderRequest.id,
          index + 1,
          item.id,
          item.name,
          item.unit,
          item.price,
          item.quantity,
        ],
      );
    }

    for (const event of orderRequest.auditTrail) {
      await query(
        `
          INSERT INTO greenmart_order_request_audit_events (
            id,
            order_request_id,
            type,
            message,
            created_at
          )
          VALUES ($1, $2, $3, $4, $5::timestamptz)
        `,
        [
          event.id,
          orderRequest.id,
          event.type,
          event.message,
          event.createdAt,
        ],
      );
    }
  });

  return record;
}

async function deleteOrderRequestRecord(id: string) {
  const result = await query("DELETE FROM greenmart_order_requests WHERE id = $1", [
    id,
  ]);
  return result.rowCount ?? 0;
}

async function replaceOrderRequestRecords<T extends { id: string }>(records: T[]) {
  await withDatabaseTransaction(async () => {
    await query("DELETE FROM greenmart_order_requests");
    for (const record of records) {
      await putOrderRequestRecord(record);
    }
  });
}

export async function listRecords<T>(collection: string): Promise<T[]> {
  if (collection === DB_COLLECTIONS.orderRequests) {
    return listOrderRequestRecords<T>();
  }
  if (collection === DB_COLLECTIONS.outboxEvents) {
    return listOutboxEvents<T>();
  }

  const result = await query<{ data: T }>(
    `
      SELECT data
      FROM greenmart_records
      WHERE collection = $1
      ORDER BY updated_at DESC, id ASC
    `,
    [collection],
  );
  return result.rows.map((row) => row.data);
}

export async function getRecord<T>(
  collection: string,
  id: string,
): Promise<T | null> {
  if (collection === DB_COLLECTIONS.orderRequests) {
    return getOrderRequestRecord<T>(id);
  }
  if (collection === DB_COLLECTIONS.outboxEvents) {
    return getOutboxEvent<T>(id);
  }

  const result = await query<{ data: T }>(
    `
      SELECT data
      FROM greenmart_records
      WHERE collection = $1 AND id = $2
    `,
    [collection, id],
  );
  return result.rows[0]?.data ?? null;
}

export async function putRecord<T extends { id: string }>(
  collection: string,
  record: T,
) {
  if (collection === DB_COLLECTIONS.orderRequests) {
    return putOrderRequestRecord(record);
  }
  if (collection === DB_COLLECTIONS.outboxEvents) {
    return putOutboxEvent(record);
  }

  await query(
    `
      INSERT INTO greenmart_records (collection, id, data, created_at, updated_at)
      VALUES ($1, $2, $3::jsonb, NOW(), NOW())
      ON CONFLICT (collection, id) DO UPDATE SET
        data = EXCLUDED.data,
        updated_at = EXCLUDED.updated_at
    `,
    [collection, record.id, JSON.stringify(record)],
  );

  return record;
}

export async function deleteRecord(collection: string, id: string) {
  if (collection === DB_COLLECTIONS.orderRequests) {
    return deleteOrderRequestRecord(id);
  }
  if (collection === DB_COLLECTIONS.outboxEvents) {
    return deleteOutboxEvent(id);
  }

  const result = await query(
    "DELETE FROM greenmart_records WHERE collection = $1 AND id = $2",
    [collection, id],
  );
  return result.rowCount ?? 0;
}

export async function replaceCollection<T extends { id: string }>(
  collection: string,
  records: T[],
) {
  if (collection === DB_COLLECTIONS.orderRequests) {
    await replaceOrderRequestRecords(records);
    return;
  }
  if (collection === DB_COLLECTIONS.outboxEvents) {
    await replaceOutboxEvents(records);
    return;
  }

  await withDatabaseTransaction(async () => {
    await query("DELETE FROM greenmart_records WHERE collection = $1", [
      collection,
    ]);
    for (const record of records) {
      await putRecord(collection, record);
    }
  });
}

export async function withDatabaseTransaction<T>(
  operation: () => T | Promise<T>,
): Promise<T> {
  const existingClient = txStorage.getStore();
  if (existingClient) return operation();

  await ensureDatabase();
  const client = await getPool().connect();

  try {
    await client.query("BEGIN");
    return await txStorage.run(client, async () => {
      try {
        const result = await operation();
        await client.query("COMMIT");
        return result;
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    });
  } finally {
    client.release();
  }
}

export async function getServiceCatalog(): Promise<ServiceCatalog> {
  const [products, deliverySlots, subscriptionPlans] = await Promise.all([
    listRecords<ServiceProduct>(DB_COLLECTIONS.serviceProducts),
    listRecords<DeliverySlot>(DB_COLLECTIONS.serviceDeliverySlots),
    listRecords<SubscriptionPlan>(DB_COLLECTIONS.serviceSubscriptionPlans),
  ]);

  return { products, deliverySlots, subscriptionPlans };
}

export async function getLatestOutboxEvent(
  aggregateId: string,
): Promise<StoredOutboxEvent | null> {
  const result = await query(
    `
      SELECT *
      FROM greenmart_outbox_events
      WHERE aggregate_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `,
    [aggregateId],
  );
  return result.rows[0] ? rowToOutboxEvent(result.rows[0]) : null;
}

export async function claimDueOutboxEvents(options: {
  aggregateId?: string;
  limit: number;
  now: Date;
  ignoreSchedule?: boolean;
}): Promise<StoredOutboxEvent[]> {
  const filters = [
    "event_type = $1",
    "status = ANY($2::text[])",
    "attempts < max_attempts",
  ];
  const values: unknown[] = [
    "ORDER_REQUEST_WEBHOOK",
    ["PENDING", "FAILED"],
    Math.max(1, Math.min(options.limit, 50)),
    options.now.toISOString(),
  ];

  if (options.aggregateId) {
    values.push(options.aggregateId);
    filters.push(`aggregate_id = $${values.length}`);
  }
  if (!options.ignoreSchedule) {
    filters.push("next_attempt_at <= $4::timestamptz");
  }

  const result = await withDatabaseTransaction(async () => {
    const claim = await query(
      `
        WITH due_events AS (
          SELECT id
          FROM greenmart_outbox_events
          WHERE ${filters.join(" AND ")}
          ORDER BY next_attempt_at ASC, created_at ASC
          LIMIT $3
          FOR UPDATE SKIP LOCKED
        )
        UPDATE greenmart_outbox_events AS event
        SET
          status = 'PROCESSING',
          locked_at = $4::timestamptz,
          updated_at = $4::timestamptz
        FROM due_events
        WHERE event.id = due_events.id
        RETURNING event.*
      `,
      values,
    );
    return claim.rows.map(rowToOutboxEvent);
  });

  return result;
}

export async function resetDatabaseConnectionForTests() {
  setupPromise = null;
  await pool?.end();
  pool = null;
}

export async function setDatabaseUrlForTests(databaseUrl: string) {
  await resetDatabaseConnectionForTests();
  globalDatabase.__greenmartDatabaseUrl = databaseUrl;
}

const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS greenmart_records (
    collection TEXT NOT NULL,
    id TEXT NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (collection, id)
  );

  CREATE INDEX IF NOT EXISTS idx_greenmart_records_collection
    ON greenmart_records(collection);

  CREATE TABLE IF NOT EXISTS greenmart_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS greenmart_order_requests (
    id TEXT PRIMARY KEY,
    order_number TEXT NOT NULL UNIQUE,
    idempotency_key TEXT NOT NULL UNIQUE,
    payload_hash TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('RECEIVED', 'CONTACTED', 'CONFIRMED', 'CANCELLED')),
    fulfillment_risk TEXT NOT NULL CHECK (fulfillment_risk IN ('LOW', 'MEDIUM', 'HIGH')),
    webhook_sync_status TEXT NOT NULL CHECK (webhook_sync_status IN ('NOT_CONFIGURED', 'PENDING', 'DELIVERED', 'FAILED')),
    webhook_attempts INTEGER NOT NULL DEFAULT 0 CHECK (webhook_attempts >= 0),
    next_webhook_attempt_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    sla_due_at TIMESTAMPTZ NOT NULL,
    customer JSONB NOT NULL,
    delivery_slot JSONB NOT NULL,
    subscription_plan JSONB NOT NULL,
    pricing JSONB NOT NULL,
    risk_reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
    data JSONB NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_greenmart_order_requests_status
    ON greenmart_order_requests(status);
  CREATE INDEX IF NOT EXISTS idx_greenmart_order_requests_risk
    ON greenmart_order_requests(fulfillment_risk);
  CREATE INDEX IF NOT EXISTS idx_greenmart_order_requests_accepted_at
    ON greenmart_order_requests(accepted_at DESC);

  CREATE TABLE IF NOT EXISTS greenmart_order_request_items (
    order_request_id TEXT NOT NULL REFERENCES greenmart_order_requests(id) ON DELETE CASCADE,
    line_no INTEGER NOT NULL,
    product_id TEXT NOT NULL,
    name TEXT NOT NULL,
    unit TEXT NOT NULL,
    price INTEGER NOT NULL CHECK (price >= 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    PRIMARY KEY (order_request_id, line_no)
  );

  CREATE INDEX IF NOT EXISTS idx_greenmart_order_request_items_product_id
    ON greenmart_order_request_items(product_id);

  CREATE TABLE IF NOT EXISTS greenmart_order_request_audit_events (
    id TEXT PRIMARY KEY,
    order_request_id TEXT NOT NULL REFERENCES greenmart_order_requests(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_greenmart_order_request_audit_order
    ON greenmart_order_request_audit_events(order_request_id, created_at ASC);

  CREATE TABLE IF NOT EXISTS greenmart_outbox_events (
    id TEXT PRIMARY KEY,
    aggregate_id TEXT NOT NULL,
    aggregate_type TEXT NOT NULL CHECK (aggregate_type IN ('ORDER_REQUEST')),
    event_type TEXT NOT NULL CHECK (event_type IN ('ORDER_REQUEST_WEBHOOK')),
    payload JSONB NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'PROCESSING', 'DELIVERED', 'FAILED', 'DEAD_LETTER', 'SKIPPED')),
    attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
    max_attempts INTEGER NOT NULL DEFAULT 5 CHECK (max_attempts > 0),
    next_attempt_at TIMESTAMPTZ NOT NULL,
    locked_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    last_error TEXT,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_greenmart_outbox_claim
    ON greenmart_outbox_events(event_type, status, next_attempt_at, created_at)
    WHERE status IN ('PENDING', 'FAILED');
  CREATE INDEX IF NOT EXISTS idx_greenmart_outbox_aggregate
    ON greenmart_outbox_events(aggregate_id, created_at DESC);
`;

const serviceProductsSeed: ServiceProduct[] = [
  {
    id: "box-seasonal",
    catalogProductId: "prod-1",
    name: "이번 주 제철 채소 박스",
    farm: "양평 새벽농장",
    category: "채소",
    price: 28900,
    unit: "1박스",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80",
    description: "샐러드 채소, 구이용 뿌리채소, 허브를 산지 상황에 맞춰 구성합니다.",
    badges: ["당일 수확", "무농약"],
    stock: 18,
  },
  {
    id: "fruit-morning",
    catalogProductId: "prod-2",
    name: "아침 과일 세트",
    farm: "상주 햇살과수원",
    category: "과일",
    price: 24600,
    unit: "6입",
    image:
      "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=900&q=80",
    description: "사과, 배, 감귤을 소가구 냉장 보관량에 맞춰 소포장했습니다.",
    badges: ["저당 선별", "소포장"],
    stock: 24,
  },
  {
    id: "salad-kit",
    catalogProductId: "prod-3",
    name: "5분 샐러드 키트",
    farm: "성수 키친랩",
    category: "간편식",
    price: 11900,
    unit: "2인분",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80",
    description: "세척 채소, 곡물 토핑, 드레싱을 한 팩에 담은 평일 점심 키트입니다.",
    badges: ["조리 없음", "비건 옵션"],
    stock: 32,
  },
  {
    id: "milk-yogurt",
    catalogProductId: "prod-4",
    name: "목장 요거트 번들",
    farm: "홍성 작은목장",
    category: "유제품",
    price: 16800,
    unit: "4개",
    image:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80",
    description: "저온 발효 요거트와 그래놀라를 함께 받을 수 있는 아침 번들입니다.",
    badges: ["무가당", "냉장배송"],
    stock: 15,
  },
  {
    id: "roots-pack",
    catalogProductId: "prod-5",
    name: "구이용 뿌리채소 팩",
    farm: "괴산 흙담농원",
    category: "채소",
    price: 13200,
    unit: "900g",
    image:
      "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=900&q=80",
    description: "당근, 비트, 감자를 손질해 오븐과 에어프라이어에 바로 넣기 좋습니다.",
    badges: ["흙당일 제거", "구이 추천"],
    stock: 27,
  },
  {
    id: "soup-pack",
    catalogProductId: "prod-6",
    name: "퇴근 후 수프 팩",
    farm: "GreenMart 키친",
    category: "간편식",
    price: 14900,
    unit: "2팩",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80",
    description: "제철 채소를 갈아 만든 냉장 수프입니다. 데우기만 하면 됩니다.",
    badges: ["저염", "냉장배송"],
    stock: 21,
  },
];

const deliverySlotsSeed: DeliverySlot[] = [
  { id: "thu-am", label: "목요일", time: "07:00 - 10:00", capacity: "6자리" },
  { id: "fri-pm", label: "금요일", time: "18:00 - 21:00", capacity: "9자리" },
  { id: "sat-am", label: "토요일", time: "08:00 - 11:00", capacity: "4자리" },
];

const subscriptionPlansSeed: SubscriptionPlan[] = [
  {
    id: "once",
    title: "한 번만 받기",
    summary: "필요할 때 주문",
    discount: "기본가",
  },
  {
    id: "weekly",
    title: "매주 받기",
    summary: "식단 루틴에 맞춘 자동 구성",
    discount: "7% 절약",
  },
  {
    id: "biweekly",
    title: "격주 받기",
    summary: "소가구 냉장고에 맞는 주기",
    discount: "4% 절약",
  },
];

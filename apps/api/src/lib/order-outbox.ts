import { randomUUID } from "crypto";
import {
  claimDueOutboxEvents,
  DB_COLLECTIONS,
  getLatestOutboxEvent,
  putRecord,
  replaceCollection,
  type StoredOutboxEvent,
} from "./greenmart-db";

export type OutboxEventStatus = StoredOutboxEvent["status"];
export type OutboxEvent = StoredOutboxEvent;

export interface OutboxDeliveryState {
  status: "NOT_CONFIGURED" | "PENDING" | "DELIVERED" | "FAILED";
  attempts: number;
  nextAttemptAt?: string;
  event?: OutboxEvent;
}

type EnqueueWebhookOptions = {
  aggregateId: string;
  payload: unknown;
  webhookUrl?: string;
  now?: Date;
};

type WorkerOptions = {
  webhookUrl?: string;
  dispatchWebhook?: typeof fetch;
  aggregateId?: string;
  limit?: number;
  now?: Date;
  retryBaseDelayMs?: number;
  ignoreSchedule?: boolean;
};

type OutboxWorkerResult = {
  delivered: number;
  failed: number;
  skipped: number;
  processedEventIds: string[];
};

export function toOutboxDeliveryState(event?: OutboxEvent | null): OutboxDeliveryState {
  if (!event) {
    return { status: "PENDING", attempts: 0 };
  }

  if (event.status === "SKIPPED") {
    return {
      status: "NOT_CONFIGURED",
      attempts: event.attempts,
      nextAttemptAt: event.nextAttemptAt,
      event,
    };
  }

  if (event.status === "DELIVERED") {
    return {
      status: "DELIVERED",
      attempts: event.attempts,
      nextAttemptAt: event.nextAttemptAt,
      event,
    };
  }

  if (event.status === "FAILED" || event.status === "DEAD_LETTER") {
    return {
      status: "FAILED",
      attempts: event.attempts,
      nextAttemptAt: event.nextAttemptAt,
      event,
    };
  }

  return {
    status: "PENDING",
    attempts: event.attempts,
    nextAttemptAt: event.nextAttemptAt,
    event,
  };
}

function backoffDelayMs(attempts: number, retryBaseDelayMs: number) {
  return retryBaseDelayMs * Math.pow(2, Math.max(0, attempts - 1));
}

export async function enqueueOrderRequestWebhook(
  options: EnqueueWebhookOptions,
): Promise<OutboxDeliveryState> {
  const existing = await getLatestOutboxEvent(options.aggregateId);
  if (existing) return toOutboxDeliveryState(existing);

  const event = createOrderRequestWebhookOutboxEvent(options);
  await putRecord(DB_COLLECTIONS.outboxEvents, event);
  return toOutboxDeliveryState(event);
}

export function createOrderRequestWebhookOutboxEvent(
  options: EnqueueWebhookOptions,
): OutboxEvent {
  const timestamp = (options.now ?? new Date()).toISOString();
  const event: OutboxEvent = {
    id: `outbox-${randomUUID()}`,
    aggregateId: options.aggregateId,
    aggregateType: "ORDER_REQUEST",
    eventType: "ORDER_REQUEST_WEBHOOK",
    payload: options.payload,
    status: options.webhookUrl ? "PENDING" : "SKIPPED",
    attempts: 0,
    maxAttempts: 5,
    nextAttemptAt: timestamp,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  if (!options.webhookUrl) {
    event.lastError = "GREENMART_ORDER_WEBHOOK_URL is not configured.";
  }

  return event;
}

export async function getOutboxDeliveryState(
  aggregateId: string,
): Promise<OutboxDeliveryState> {
  return toOutboxDeliveryState(await getLatestOutboxEvent(aggregateId));
}

export async function runWebhookOutboxWorker(
  options: WorkerOptions = {},
): Promise<OutboxWorkerResult> {
  const now = options.now ?? new Date();
  const limit = Math.max(1, Math.min(options.limit ?? 10, 50));
  const retryBaseDelayMs = options.retryBaseDelayMs ?? 60_000;
  const webhookUrl = options.webhookUrl;
  const dispatchWebhook = options.dispatchWebhook ?? globalThis.fetch?.bind(globalThis);

  if (!webhookUrl || !dispatchWebhook) {
    return { delivered: 0, failed: 0, skipped: 0, processedEventIds: [] };
  }

  const claimedEvents = await claimDueOutboxEvents({
    aggregateId: options.aggregateId,
    limit,
    now,
    ignoreSchedule: options.ignoreSchedule,
  });

  let delivered = 0;
  let failed = 0;

  for (const event of claimedEvents) {
    try {
      const response = await dispatchWebhook(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": event.id,
        },
        body: JSON.stringify(event.payload),
      });

      if (!response.ok) {
        throw new Error(`Webhook responded ${response.status}`);
      }

      const deliveredAt = new Date().toISOString();
      await putRecord(DB_COLLECTIONS.outboxEvents, {
        ...event,
        status: "DELIVERED",
        attempts: event.attempts + 1,
        deliveredAt,
        lockedAt: undefined,
        lastError: undefined,
        updatedAt: deliveredAt,
      });
      delivered += 1;
    } catch (error) {
      const attempts = event.attempts + 1;
      const updatedAt = new Date().toISOString();
      await putRecord(DB_COLLECTIONS.outboxEvents, {
        ...event,
        attempts,
        status: attempts >= event.maxAttempts ? "DEAD_LETTER" : "FAILED",
        lockedAt: undefined,
        lastError:
          error instanceof Error ? error.message : "Unknown webhook error",
        nextAttemptAt: new Date(
          Date.now() + backoffDelayMs(attempts, retryBaseDelayMs),
        ).toISOString(),
        updatedAt,
      });
      failed += 1;
    }
  }

  return {
    delivered,
    failed,
    skipped: 0,
    processedEventIds: claimedEvents.map((event) => event.id),
  };
}

export async function resetOutboxDatabaseForTests(events: OutboxEvent[] = []) {
  await replaceCollection(DB_COLLECTIONS.outboxEvents, events);
}

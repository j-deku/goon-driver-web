// A persistent, retry-capable queue for axios requests.
// Stores serializable parts of the axios config in IndexedDB via Dexie.

import db from './db';

// Tiny event emitter (no extra deps)
const listeners = new Set();
const emit = (event, payload) => listeners.forEach((cb) => cb(event, payload));
export const subscribeQueue = (cb) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

const RETRY_BASE_MS = 2000;
const RETRY_MAX_ATTEMPTS = 5;

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const serializeRequest = (config) => {
  // Only keep serializable/safe fields
  const {
    url,
    method = 'get',
    data = undefined,
    params = undefined,
    headers = undefined, // you can filter sensitive headers if you want
    withCredentials = true,
    timeout,
  } = config;

  return { url, method, data, params, headers, withCredentials, timeout };
};

const backoff = (attempt) =>
  Math.min(RETRY_BASE_MS * 2 ** attempt, 60_000) + Math.floor(Math.random() * 300);

class PersistentQueue {
  constructor() {
    this.processing = false;

    window.addEventListener('online', () => {
      this.processAll().catch((e) => console.error('processAll error', e));
    });
  }

  async size() {
    return db.requests.count();
  }

  async enqueue(axiosConfig) {
    const payload = serializeRequest(axiosConfig);
    const now = Date.now();
    const record = {
      ...payload,
      attempts: 0,
      createdAt: now,
      nextRetryAt: now, // can retry immediately on first online tick
    };

    const id = await db.requests.add(record);
    emit('queued', { id });
    return id;
  }

  async processAll(axiosInstance) {
    if (this.processing) return;
    this.processing = true;

    try {
      while (true) {
        const now = Date.now();

        // Pick one eligible request to retry
        const item = await db.requests
          .where('nextRetryAt')
          .belowOrEqual(now)
          .first();

        if (!item) break;

        try {
          await axiosInstance({
            url: item.url,
            method: item.method,
            data: item.data,
            params: item.params,
            headers: item.headers,
            withCredentials: item.withCredentials,
            timeout: item.timeout,
          });

          await db.requests.delete(item.id);
          emit('flushed_one', { id: item.id });
        } catch (err) {
          const attempts = item.attempts + 1;

          if (attempts >= RETRY_MAX_ATTEMPTS) {
            // Give up, but keep it if you want to inspect later, or delete it.
            await db.requests.delete(item.id);
            emit('dropped', { id: item.id, error: err });
          } else {
            const nextRetryAt = Date.now() + backoff(attempts);
            await db.requests.update(item.id, { attempts, nextRetryAt });
            emit('retry_scheduled', { id: item.id, attempts, nextRetryAt });
          }
        }

        // tiny yield to keep UI responsive
        await sleep(0);
      }
    } finally {
      this.processing = false;
    }
  }
}

const persistentQueue = new PersistentQueue();
export default persistentQueue;

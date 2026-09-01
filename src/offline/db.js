import Dexie from 'dexie';

const db = new Dexie('offlineQueueDB');
db.version(1).stores({
  // indexes: id (PK), method, url, nextRetryAt, attempts
  requests: '++id, method, url, nextRetryAt, attempts'
});

export default db;

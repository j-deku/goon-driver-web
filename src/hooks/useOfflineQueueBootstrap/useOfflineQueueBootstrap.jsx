// src/hooks/useOfflineQueueBootstrap.js
import { useEffect, useState } from 'react';
import persistentQueue, { subscribeQueue } from '../../offline/persistentQueue';
import axiosInstanceNetwork from '../../../axiosInstanceNetwork';

export default function useOfflineQueueBootstrap() {
  const [queuedCount, setQueuedCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    const syncCount = async () => {
      const count = await persistentQueue.size();
      if (mounted) setQueuedCount(count);
    };

    // initial count
    syncCount();

    // listen to queue events
    const unsub = subscribeQueue(async () => {
      await syncCount();
    });

    // attempt processing on load if we're online
    if (navigator.onLine) {
      persistentQueue.processAll(axiosInstanceNetwork);
    }

    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  const retryNow = () => persistentQueue.processAll(axiosInstanceNetwork);

  return { queuedCount, retryNow };
}

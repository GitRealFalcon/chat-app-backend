const buckets = new Map();

const getBucketKey = (socketId, eventName) => `${socketId}:${eventName}`;

const sweepExpiredBuckets = () => {
  const now = Date.now();

  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
};

export const checkSocketEventRateLimit = (
  socket,
  eventName,
  { limit = 10, windowMs = 1000 } = {},
) => {
  if (!socket?.id || !eventName) {
    return true;
  }

  const now = Date.now();
  const key = getBucketKey(socket.id, eventName);
  let bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    bucket = {
      count: 0,
      resetAt: now + windowMs,
    };
  }

  if (bucket.count >= limit) {
    buckets.set(key, bucket);
    return false;
  }

  bucket.count += 1;
  buckets.set(key, bucket);
  return true;
};

setInterval(sweepExpiredBuckets, 60 * 1000).unref();

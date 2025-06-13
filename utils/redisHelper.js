const redis = require("../config/redis-config");

const NOTIFIED_CAPTAINS_PREFIX = "ride:notified:";
const CAPTAIN_SOCKET_KEY = "captain:sockets";
const TTL_SECONDS = 60 * 30; // 30 minutes

/**
 * Store the list of captain IDs that were notified for a ride.
 */
async function storeNotifiedCaptains(rideId, captainIds = []) {
  if (!rideId || !captainIds.length) return;
  const key = `${NOTIFIED_CAPTAINS_PREFIX}${rideId}`;

  await redis.sadd(key, ...captainIds);
  await redis.expire(key, TTL_SECONDS); // auto-expire after 15 seconds
}

/**
 * Retrieve notified captain IDs for a given ride.
 */
async function getNotifiedCaptains(rideId) {
  const key = `${NOTIFIED_CAPTAINS_PREFIX}${rideId}`;
  return await redis.smembers(key);
}

/**
 * Remove the notification data after ride is accepted or cancelled.
 */
async function clearNotifiedCaptains(rideId) {
  const key = `${NOTIFIED_CAPTAINS_PREFIX}${rideId}`;
  await redis.del(key);
}

/**
 * Store captain's socket ID globally
 */
async function storeCaptainSocket(captainId, socketId) {
//  console.log('inside redis captins socekt store', captainId, socketId)
    await redis.hset(CAPTAIN_SOCKET_KEY, captainId, socketId);
    const socket=await redis.hget(CAPTAIN_SOCKET_KEY, captainId);
    console.log('check', socket);
}

/**
 * Get socket ID for one captain
 */
async function getCaptainSocket(captainId) {
//   console.log('inside  get captain socekt id', captainId);
    return await redis.hget(CAPTAIN_SOCKET_KEY, captainId);
}

module.exports = {
  storeNotifiedCaptains,
  getNotifiedCaptains,
  clearNotifiedCaptains,
  storeCaptainSocket,
  getCaptainSocket,
};

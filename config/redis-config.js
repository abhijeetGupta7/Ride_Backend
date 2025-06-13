const { NODE_ENV } = require("./server-config");

const isProduction = NODE_ENV === "production";

/**
 * @type {import('ioredis').Redis | import('@upstash/redis').Redis}
 */
let redis;

if (isProduction) {
  const { Redis } = require("@upstash/redis");
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
    tls: { rejectUnauthorized: false },
  },

);
} else {
  const Redis = require("ioredis");
  redis = new Redis(); 
}

module.exports = redis;

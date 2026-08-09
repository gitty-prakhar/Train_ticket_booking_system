import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import Redis from "ioredis";

// Create a dedicated Redis connection for the rate limiter
const redisClient = new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379,
    // Required by rate-limit-redis
    enableOfflineQueue: false,
});

export const tatkalRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute window
    max: 5, // Limit each IP to 5 requests per `windowMs`
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    store: new RedisStore({
        // @ts-expect-error - Known issue with @types/ioredis
        sendCommand: (...args) => redisClient.call(...args),
    }),
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: "Too many booking attempts from this IP. Please try again after a minute.",
            data: null
        });
    }
});

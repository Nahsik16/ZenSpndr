import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import "dotenv/config";

const ratelimit = new Ratelimit({
  redis: new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  }),
  limiter: Ratelimit.slidingWindow(100, "30 s"),
});

export default ratelimit;
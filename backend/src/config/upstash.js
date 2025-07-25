import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import "dotenv/config";
const ratelimit = new Ratelimit({
 redis:Redis.fromEnv(),
 limiter:Ratelimit.slidingWindow(100,"30 s"),
});
export default ratelimit;
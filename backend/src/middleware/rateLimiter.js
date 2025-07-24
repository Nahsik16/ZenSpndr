import ratelimit from "../config/upstash.js"

const rateLimiter = async (req, res, next) => {
  try {
    // Get client IP for rate limiting
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    
    const { success, limit, reset, remaining } = await ratelimit.limit(clientIP);
    
    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': limit,
      'X-RateLimit-Remaining': remaining,
      'X-RateLimit-Reset': new Date(reset),
    });
    
    if (!success) {
      return res.status(429).json({
        success: false,
        error: "Too many requests, please try again later",
        retryAfter: Math.round((reset - Date.now()) / 1000),
      });
    }
    
    next();

  } catch (error) {
    console.log("Rate limit error:", error);
    // If Redis is down, allow the request to proceed rather than blocking everything
    console.warn("Rate limiter failed, allowing request to proceed");
    next();
  }
}

export default rateLimiter;